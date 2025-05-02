import { AfipClient } from '../afipClient'
import { AuthenticationService } from './authentication'
import { afipConfig } from '../../config/afipConfig'

interface IParameterResponse {
  Id: string
  Desc: string
}

export class ParametersService {
  private readonly afipClient: AfipClient
  private readonly authService: AuthenticationService
  SERVICE_NAME_AUTH_AFIP = process.env.SERVICE_NAME_AUTH_AFIP ?? 'wsfe'

  constructor () {
    this.afipClient = new AfipClient()
    this.authService = new AuthenticationService(this.SERVICE_NAME_AUTH_AFIP)
  }

  private async getAuthPayload (): Promise<{ Auth: { Token: string, Sign: string, Cuit: string } }> {
    const { token, sign } = await this.authService.getAuth()
    return {
      Auth: { Token: token, Sign: sign, Cuit: afipConfig.cuit }
    }
  }

  // Obtener tipos de comprobantes (Factura, Nota de Crédito, etc.)
  async getInvoiceTypes (): Promise<IParameterResponse> {
    const authPayload = await this.getAuthPayload()
    const response = await this.afipClient.callMethod('FEParamGetTiposCbte', authPayload)

    const invoiceTypes = response?.['soap:Envelope']?.['soap:Body']?.FEParamGetTiposCbteResponse?.FEParamGetTiposCbteResult?.ResultGet?.CbteTipo

    return invoiceTypes.map((invoiceType: IParameterResponse) => ({
      id: invoiceType.Id,
      name: invoiceType.Desc
    }))
  }

  async getIVACondicionReceptor (): Promise<any> {
    const authPayload = await this.getAuthPayload()
    const response = await this.afipClient.callMethod('FEParamGetCondicionIvaReceptor', authPayload)

    const invoiceTypes = response?.['soap:Envelope']?.['soap:Body']?.FEParamGetCondicionIvaReceptorResponse?.FEParamGetCondicionIvaReceptorResult?.ResultGet?.CondicionIvaReceptor

    return invoiceTypes?.map((invoiceType: { Id: string, Desc: string, Cmp_Clase: string }) => ({
      id: invoiceType.Id,
      name: invoiceType.Desc
    }))
  }

  // Obtener alícuotas de IVA (0%, 10.5%, 21%, etc.)
  async getIvaRates (): Promise<IParameterResponse> {
    const authPayload = await this.getAuthPayload()
    const response = await this.afipClient.callMethod('FEParamGetTiposIva', authPayload)

    const ivaRates = response?.['soap:Envelope']?.['soap:Body']?.FEParamGetTiposIvaResponse?.FEParamGetTiposIvaResult?.ResultGet?.IvaTipo

    // Formatear los datos para mejor legibilidad
    const formattedTiposIva = ivaRates?.map((ivaRate: IParameterResponse) => ({
      id: ivaRate.Id,
      name: ivaRate.Desc
    }))

    return formattedTiposIva
  }

  // Obtener tipos de documentos (CUIT, DNI, etc.)
  async getDocumentTypes (): Promise<IParameterResponse> {
    const authPayload = await this.getAuthPayload()
    const response = await this.afipClient.callMethod('FEParamGetTiposDoc', authPayload)

    // Extraer tipos de documentos
    const documentTypes =
    response['soap:Envelope']?.['soap:Body']?.FEParamGetTiposDocResponse?.FEParamGetTiposDocResult?.ResultGet?.DocTipo

    // Formatear los datos para mejor legibilidad
    const formattedDocumentTypes = documentTypes?.map((documentType: IParameterResponse) => ({
      id: documentType.Id,
      name: documentType.Desc
    }))

    return formattedDocumentTypes
  }

  // Obtener monedas disponibles
  async getCurrencies (): Promise<IParameterResponse> {
    const authPayload = await this.getAuthPayload()
    const response = await this.afipClient.callMethod('FEParamGetTiposMonedas', authPayload)

    const currenciesTypes = response['soap:Envelope']?.['soap:Body']?.FEParamGetTiposMonedasResponse?.FEParamGetTiposMonedasResult?.ResultGet?.Moneda

    // Formatear los datos para mejor legibilidad
    const formattedCurrencyTypes = currenciesTypes?.map((currencyType: IParameterResponse) => ({
      id: currencyType.Id,
      name: currencyType.Desc
    }))

    return formattedCurrencyTypes
  }

  async getConceptTypes (): Promise<IParameterResponse> {
    const authPayload = await this.getAuthPayload()
    const response = await this.afipClient.callMethod('FEParamGetTiposConcepto', authPayload)

    // Extraer los tipos de conceptos
    const conceptTypes =
    response['soap:Envelope']?.['soap:Body']?.FEParamGetTiposConceptoResponse?.FEParamGetTiposConceptoResult?.ResultGet?.ConceptoTipo

    // Formatear los datos para mejor legibilidad
    const formattedConceptTypes = conceptTypes?.map((conceptType: IParameterResponse) => ({
      id: conceptType.Id,
      name: conceptType.Desc
    }))

    return formattedConceptTypes
  }

  async getLastVoucher (pointOfSale: number, invoiceType: number): Promise<number> {
    const authPayload = (await this.getAuthPayload()).Auth

    const payload = {
      Auth: { ...authPayload },
      PtoVta: pointOfSale,
      CbteTipo: invoiceType
    }

    const response = await this.afipClient.callMethod('FECompUltimoAutorizado', payload)

    const lastVoucher =
    response['soap:Envelope']?.['soap:Body']?.FECompUltimoAutorizadoResponse?.FECompUltimoAutorizadoResult?.CbteNro

    return lastVoucher
  }

  async getPointOfSales (): Promise<Array<{ nro: number, bloqueado: boolean }>> {
    const authPayload = await this.getAuthPayload()
    const response = await this.afipClient.callMethod('FEParamGetPtosVenta', authPayload)

    // Extraer datos de la respuesta de AFIP
    const puntosDeVenta =
      response?.['soap:Envelope']?.['soap:Body']?.FEParamGetPtosVentaResponse?.FEParamGetPtosVentaResult?.ResultGet?.PtoVenta

    // Si no hay puntos de venta, devolver un array vacío
    if (puntosDeVenta == null) return []

    // Convertir a array si solo hay un objeto
    const puntosArray = Array.isArray(puntosDeVenta) ? puntosDeVenta : [puntosDeVenta]

    // Formatear los datos
    return puntosArray.map((pto: { Nro: string, Bloqueado: string }) => ({
      nro: Number(pto.Nro),
      bloqueado: pto.Bloqueado === 'true'
    }))
  }

  async getTributosTypes (): Promise<IParameterResponse> {
    const authPayload = await this.getAuthPayload()
    const response = await this.afipClient.callMethod('FEParamGetTiposTributos', authPayload)

    const tributoTypes =
    response['soap:Envelope']?.['soap:Body']?.FEParamGetTiposTributosResponse?.FEParamGetTiposTributosResult?.ResultGet?.TributoTipo

    // Formatear los datos para mejor legibilidad
    const formattedTributoTypes = tributoTypes?.map((tributoType: IParameterResponse) => ({
      id: tributoType.Id,
      name: tributoType.Desc
    }))

    return formattedTributoTypes
  }

  async getOptionalTypes (): Promise<IParameterResponse> {
    const authPayload = await this.getAuthPayload()
    const response = await this.afipClient.callMethod('FEParamGetTiposOpcional', authPayload)

    const optionalTypes =
    response['soap:Envelope']?.['soap:Body']?.FEParamGetTiposOpcionalResponse?.FEParamGetTiposOpcionalResult?.ResultGet?.OpcionalTipo

    // Formatear los datos para mejor legibilidad
    const formattedOptionalTypes = optionalTypes?.map((optionalType: IParameterResponse) => ({
      id: optionalType.Id,
      name: optionalType.Desc
    }))

    return formattedOptionalTypes
  }

  async getInvoiceDetails (invoiceType: number, pointOfSale: number, invoiceNumber: number): Promise<any> {
    const authPayload = (await this.getAuthPayload()).Auth

    const payload = {
      Auth: { ...authPayload },
      FeCompConsReq: {
        CbteTipo: invoiceType,
        PtoVta: pointOfSale,
        CbteNro: invoiceNumber
      }
    }
    const response = await this.afipClient.callMethod('FECompConsultar', payload)

    const invoiceData =
    response['soap:Envelope']?.['soap:Body']?.FECompConsultarResponse?.FECompConsultarResult?.ResultGet

    return invoiceData
  }
}
