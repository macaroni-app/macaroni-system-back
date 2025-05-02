import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { execSync } from 'child_process'
import { processToken } from './processToken'

import { afipConfig } from '../../../config/afipConfig'

// Rutas a tus archivos de certificado y clave
const CERT_PATH = path.resolve(__dirname, afipConfig.certPath)
const PRIVATE_KEY_PATH = path.resolve(__dirname, afipConfig.keyPath)

const WSAA_URL = process.env.WSAA_URL ?? ''
const SOAP_ACTION_BASE_LOGIN_URL = process.env.SOAP_ACTION_BASE_LOGIN_URL ?? ''

export const generateToken = async (service: string): Promise<{ token: string, sign: string, expTime: Date }> => {
  try {
    // Paso 1: Crear el XML del LoginTicketRequest
    const now = new Date()
    const uniqueId = Math.floor(now.getTime() / 1000) // ID único basado en el tiempo actual
    const generationTime = new Date(now.getTime() - 10 * 60 * 1000).toISOString() // 10 minutos atrás
    const expirationTime = new Date(now.getTime() + 10 * 60 * 1000).toISOString() // 10 minutos adelante

    const loginTicketRequestXML = `
      <loginTicketRequest version="1.0">
        <header>
          <uniqueId>${uniqueId}</uniqueId>
          <generationTime>${generationTime}</generationTime>
          <expirationTime>${expirationTime}</expirationTime>
        </header>
        <service>${service}</service>
      </loginTicketRequest>
    `

    // Guardar el XML a un archivo temporal
    const xmlFileName = `LoginTicketRequest-${uniqueId}.xml`
    fs.writeFileSync(xmlFileName, loginTicketRequestXML, 'utf8')

    // Paso 2: Firmar el XML con la clave privada usando OpenSSL
    const signedCmsFileName = `LoginTicketRequest-${uniqueId}.cms`
    const command = `openssl cms -sign -in ${xmlFileName} -signer ${CERT_PATH} -inkey ${PRIVATE_KEY_PATH} -nodetach -outform der -out ${signedCmsFileName}`

    // Ejecutar el comando OpenSSL para firmar el XML y generar el CMS
    execSync(command)

    // Paso 3: Codificar el CMS en Base64
    const cmsBuffer = fs.readFileSync(signedCmsFileName)
    const cmsBase64 = cmsBuffer.toString('base64')

    // Paso 4: Invocar al WSAA con el encabezado SOAPAction
    const headers = {
      'Content-Type': 'text/xml;charset=UTF-8',
      SOAPAction: `"${SOAP_ACTION_BASE_LOGIN_URL}/soap"`
    }

    const soapBody = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="${SOAP_ACTION_BASE_LOGIN_URL}">
        <soapenv:Header/>
        <soapenv:Body>
          <web:loginCms>
            <cms>${cmsBase64}</cms>
          </web:loginCms>
        </soapenv:Body>
      </soapenv:Envelope>
    `

    // Realizar la solicitud al WSAA
    const response = await axios.post(WSAA_URL, soapBody, { headers })

    // Limpiar archivos temporales
    fs.unlinkSync(xmlFileName)
    fs.unlinkSync(signedCmsFileName)

    // Procesar la respuesta del WSAA
    const { token, sign, expTime } = await processToken(response.data)

    return { token, sign, expTime }
  } catch (error) {
    return error
  }
}
