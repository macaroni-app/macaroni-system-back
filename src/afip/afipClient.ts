import * as soap from 'soap'
import { parseStringPromise } from 'xml2js'
import https from 'https'
import { afipConfig } from '../config/afipConfig'

export class AfipClient {
  private client: any

  async initClient (): Promise<void> {
    if (this.client) return

    try {
      const agent = new https.Agent({
        minVersion: 'TLSv1',
        rejectUnauthorized: false,
        secureOptions: require('constants').SSL_OP_LEGACY_SERVER_CONNECT
      })

      this.client = await soap.createClientAsync(afipConfig.wsfeUrl, {
        wsdl_options: { agent }
      })

      console.log('Cliente SOAP inicializado correctamente')
    } catch (error) {
      console.error('Error al crear el cliente SOAP:', error)
      throw new Error('No se pudo inicializar el cliente SOAP')
    }
  }

  async callMethod (method: string, args: object): Promise<any> {
    await this.initClient()

    try {
      const response = await this.client[`${method}Async`](args)

      if (Array.isArray(response) && response.length > 0) {
        const rawXml = response[1]
        try {
          return await parseStringPromise(rawXml, { explicitArray: false })
        } catch {
          return response[0]
        }
      } else {
        throw new Error('Respuesta SOAP inesperada')
      }
    } catch (error) {
      console.error('Error en la llamada SOAP:', error)
      throw error
    }
  }
}
