import { parseStringPromise } from 'xml2js'
import { afipConfig } from '../config/afipConfig'

import * as soap from 'soap'

export class AfipClient {
  private client: any

  // Inicializa el cliente SOAP solo una vez
  async initClient (): Promise<void> {
    if (this.client === undefined || this.client === null) {
      try {
        // Asegúrate de que la URL está correctamente configurada
        this.client = await soap.createClientAsync(afipConfig.wsfeUrl)
        console.log('Cliente SOAP inicializado correctamente')
      } catch (error) {
        console.error('Error al crear el cliente SOAP:', error)
        throw new Error('No se pudo inicializar el cliente SOAP')
      }
    }
  }

  // Método genérico para hacer llamadas a cualquier operación SOAP
  async callMethod (method: string, args: object): Promise<any> {
    await this.initClient()
    try {
      const response = await this.client[`${method}Async`](args)

      if (Array.isArray(response) && response.length > 0) {
        const xmlResponse = response[1] // Normalmente el segundo elemento es el raw XML

        try {
          // Intentamos parsear la respuesta si es XML
          const parsedData = await parseStringPromise(xmlResponse, { explicitArray: false })
          return parsedData
        } catch (error) {
          console.warn('No se pudo parsear la respuesta como XML, retornando JSON plano.')
          return response[0] // Retorna el JSON nativo
        }
      } else {
        throw new Error('Respuesta SOAP inesperada')
      }
    } catch (error) {
      return error
    }
  }
}
