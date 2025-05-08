import { parseStringPromise } from 'xml2js'
import { afipConfig } from '../config/afipConfig'
import * as soap from 'soap'

export class AfipClient {
  private client: any

  async initClient (): Promise<void> {
    if (!this.client) {
      try {
        // Usar directamente la URL si es remota
        this.client = await soap.createClientAsync(afipConfig.wsfeUrl)
        console.log('Cliente SOAP inicializado correctamente')
      } catch (error) {
        console.error('Error al crear el cliente SOAP:', error)
        throw new Error('No se pudo inicializar el cliente SOAP')
      }
    }
  }

  async callMethod (method: string, args: object): Promise<any> {
    await this.initClient()

    const asyncMethod = `${method}Async`

    if (typeof this.client[asyncMethod] !== 'function') {
      throw new Error(`El método '${asyncMethod}' no está definido en el cliente SOAP.`)
    }

    try {
      const response = await this.client[asyncMethod](args)

      if (Array.isArray(response) && response.length > 0) {
        const rawXml = response[1]
        try {
          const parsedXml = await parseStringPromise(rawXml, { explicitArray: false })
          return parsedXml
        } catch (parseError) {
          console.warn('No se pudo parsear la respuesta como XML. Se devolverá JSON plano.')
          return response[0]
        }
      } else {
        throw new Error('Respuesta SOAP inesperada: el array está vacío o mal formado.')
      }
    } catch (error) {
      console.error('Error en la llamada SOAP:', error)
      throw error
    }
  }
}
