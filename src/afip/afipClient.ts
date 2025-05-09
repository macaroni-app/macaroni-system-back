import { parseStringPromise } from 'xml2js'
import { afipConfig } from '../config/afipConfig'
import * as soap from 'soap'
import https from 'https'

export class AfipClient {
  private client: any

  async initClient (): Promise<void> {
    if (!this.client) {
      try {
        const wsdlPath = afipConfig.wsfeUrl

        const agent = new https.Agent({
          minVersion: 'TLSv1',
          secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT,
          rejectUnauthorized: false
        })

        this.client = await soap.createClientAsync(wsdlPath, {
          wsdl_options: { agent }
        })

        console.log('Cliente SOAP inicializado correctamente')
      } catch (error) {
        console.error('Error al crear el cliente SOAP:', error)
        throw new Error('No se pudo inicializar el cliente SOAP')
      }
    }
  }

  async callMethod (method: string, args: object): Promise<any> {
    await this.initClient()

    if (typeof this.client[`${method}`] !== 'function') {
      throw new Error(`El método '${method}' no está definido en el cliente SOAP.`)
    }

    try {
      const response = await this.client[`${method}Async`](args)

      if (Array.isArray(response) && response.length > 0) {
        const rawXml = response[1]
        try {
          const parsed = await parseStringPromise(rawXml, { explicitArray: false })
          return parsed
        } catch (error) {
          console.warn('No se pudo parsear XML, devolviendo JSON plano.')
          return response[0]
        }
      } else {
        throw new Error('Respuesta SOAP inesperada.')
      }
    } catch (error) {
      console.error('Error en la llamada SOAP:', error)
      throw error
    }
  }
}
