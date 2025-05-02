import { afipConfig } from '../../config/afipConfig'
import { AfipInvoiceType } from '../../schemas/afipInvoice'
import { AfipClient } from '../afipClient'
import { validateInvoiceData } from '../utils/validateInvoiceData'
import { AuthenticationService } from './authentication'
import { ParametersService } from './parameters'

interface IInvoiceDetails {
  cuit?: string
  totalAmount?: number
  pointOfSale?: number
  invoiceType?: number
  concept?: number
  documentType?: string
  documentNumber?: number
  invoiceNumber?: number
  cbteFch?: string
  cae?: string
  expirationDate?: string
  sale?: string
  condicionIVAReceptorId?: string
  resultResponse?: string
}

export class InvoiceService {
  private readonly afipClient: AfipClient
  private readonly authService: AuthenticationService
  SERVICE_NAME_AUTH_AFIP = process.env.SERVICE_NAME_AUTH_AFIP ?? 'wsfe'

  constructor () {
    this.afipClient = new AfipClient()
    this.authService = new AuthenticationService(this.SERVICE_NAME_AUTH_AFIP)
  }

  async createInvoice (invoiceData: AfipInvoiceType): Promise<IInvoiceDetails> {
    const { token, sign } = await this.authService.getAuth()

    const { pointOfSale, invoiceType, totalAmount, concept, documentNumber, documentType, sale, condicionIVAReceptorId } = invoiceData

    const missingFields = validateInvoiceData(invoiceData)
    if (missingFields.length > 0) {
      throw Error(`Faltan los siguientes campos requeridos: ${missingFields.join(', ')}.`)
    }

    const parametersService = new ParametersService()
    // obtener el ultimo comprobante autorizado
    const lastVoucher = await parametersService.getLastVoucher(Number(pointOfSale), Number(invoiceType))
    const invoiceNumber = Number(lastVoucher) + 1

    const cbteFch = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0]

    try {
      const requestPayload = {
        Auth: { Token: token, Sign: sign, Cuit: afipConfig.cuit },
        FeCAEReq: {
          FeCabReq: {
            CantReg: 1,
            PtoVta: pointOfSale,
            CbteTipo: invoiceType
          },
          FeDetReq: {
            FECAEDetRequest: [
              {
                Concepto: concept,
                DocTipo: documentType,
                DocNro: documentNumber,
                CondicionIVAReceptorId: condicionIVAReceptorId,
                CbteDesde: invoiceNumber,
                CbteHasta: invoiceNumber,
                CbteFch: parseInt(cbteFch.replace(/-/g, '')),
                ImpTotal: totalAmount,
                ImpNeto: totalAmount,
                ImpTotConc: 0,
                MonId: 'PES',
                ImpIVA: 0,
                ImpTrib: 0,
                ImpOpEx: 0,
                MonCotiz: 1
              }
            ]
          }
        }
      }

      const parsedResponse = await this.afipClient.callMethod('FECAESolicitar', requestPayload)

      const cuitResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeCabResp?.Cuit
      const pointOfSaleResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeCabResp?.PtoVta
      const invoiceTypeResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeCabResp?.CbteTipo
      const conceptResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse?.Concepto
      const documentTypeResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse?.DocTipo
      const documentNumberResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse?.DocNro
      const cbteDesdeResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse?.CbteDesde
      const cbteFchResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse?.CbteFch
      const caeResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse?.CAE
      const expirationDateResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse?.CAEFchVto
      const resultResponse = parsedResponse?.['soap:Envelope']?.['soap:Body']?.FECAESolicitarResponse?.FECAESolicitarResult?.FeDetResp?.FECAEDetResponse?.Resultado

      if (resultResponse !== 'A') {
        throw new Error('La solicitud fue rechazada')
      }

      if ((caeResponse === null || caeResponse === undefined) || (expirationDateResponse === null || expirationDateResponse === undefined)) {
        throw new Error('No se encontraron los campos CAE o CAEFchVto en la respuesta.')
      }

      return {
        cuit: cuitResponse,
        pointOfSale: pointOfSaleResponse,
        invoiceType: invoiceTypeResponse,
        concept: conceptResponse,
        documentType: documentTypeResponse,
        documentNumber: documentNumberResponse,
        invoiceNumber: cbteDesdeResponse,
        cbteFch: cbteFchResponse,
        cae: caeResponse,
        expirationDate: expirationDateResponse,
        totalAmount: Number(totalAmount),
        sale: String(sale),
        condicionIVAReceptorId,
        resultResponse
      }
    } catch (error: any) {
      return error
    }
  }
}
