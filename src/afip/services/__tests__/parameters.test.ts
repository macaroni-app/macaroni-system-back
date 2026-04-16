import { afterEach, describe, expect, it, vi } from 'vitest'

import { AfipClient } from '../../afipClient'
import { AuthenticationService } from '../authentication'
import { ParametersService } from '../parameters'

const envelope = (body: Record<string, unknown>) => ({
  'soap:Envelope': {
    'soap:Body': body
  }
})

describe('ParametersService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('maps document types from AFIP response', async () => {
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })
    const callMethod = vi.spyOn(AfipClient.prototype, 'callMethod').mockResolvedValue(envelope({
      FEParamGetTiposDocResponse: {
        FEParamGetTiposDocResult: {
          ResultGet: {
            DocTipo: [
              { Id: '80', Desc: 'CUIT' },
              { Id: '96', Desc: 'DNI' }
            ]
          }
        }
      }
    }))

    const result = await new ParametersService().getDocumentTypes()

    expect(callMethod).toHaveBeenCalledWith('FEParamGetTiposDoc', {
      Auth: {
        Token: 'token',
        Sign: 'sign',
        Cuit: expect.any(String)
      }
    })
    expect(result).toEqual([
      { id: '80', name: 'CUIT' },
      { id: '96', name: 'DNI' }
    ])
  })

  it('returns a friendly error when document types request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })
    vi.spyOn(AfipClient.prototype, 'callMethod').mockRejectedValue(new Error('AFIP down'))

    const result = await new ParametersService().getDocumentTypes()

    expect(result).toBe('Fallo al contactar a AFIP')
  })

  it('maps IVA receptor conditions from AFIP response', async () => {
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })
    vi.spyOn(AfipClient.prototype, 'callMethod').mockResolvedValue({
      'soap:Envelope': {
        'soap:Header': {
          FEHeaderInfo: {}
        },
        'soap:Body': {
          FEParamGetCondicionIvaReceptorResponse: {
            FEParamGetCondicionIvaReceptorResult: {
              ResultGet: {
                CondicionIvaReceptor: [
                  { Id: '5', Desc: 'Consumidor Final', Cmp_Clase: 'A' }
                ]
              }
            }
          }
        }
      }
    })

    const result = await new ParametersService().getIVACondicionReceptor()

    expect(result).toEqual([
      { id: '5', name: 'Consumidor Final' }
    ])
  })

  it('gets the last authorized voucher number', async () => {
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })
    const callMethod = vi.spyOn(AfipClient.prototype, 'callMethod').mockResolvedValue(envelope({
      FECompUltimoAutorizadoResponse: {
        FECompUltimoAutorizadoResult: {
          CbteNro: 42
        }
      }
    }))

    const result = await new ParametersService().getLastVoucher(1, 6)

    expect(callMethod).toHaveBeenCalledWith('FECompUltimoAutorizado', {
      Auth: {
        Token: 'token',
        Sign: 'sign',
        Cuit: expect.any(String)
      },
      PtoVta: 1,
      CbteTipo: 6
    })
    expect(result).toBe(42)
  })

  it('maps point of sales and normalizes a single object response to array', async () => {
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })
    vi.spyOn(AfipClient.prototype, 'callMethod').mockResolvedValue(envelope({
      FEParamGetPtosVentaResponse: {
        FEParamGetPtosVentaResult: {
          ResultGet: {
            PtoVenta: {
              Nro: '1',
              Bloqueado: 'false'
            }
          }
        }
      }
    }))

    const result = await new ParametersService().getPointOfSales()

    expect(result).toEqual([
      { nro: 1, bloqueado: false }
    ])
  })

  it('returns an empty array when there are no point of sales', async () => {
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })
    vi.spyOn(AfipClient.prototype, 'callMethod').mockResolvedValue(envelope({
      FEParamGetPtosVentaResponse: {
        FEParamGetPtosVentaResult: {
          ResultGet: {}
        }
      }
    }))

    const result = await new ParametersService().getPointOfSales()

    expect(result).toEqual([])
  })
})
