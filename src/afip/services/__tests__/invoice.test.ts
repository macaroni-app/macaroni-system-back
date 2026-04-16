import { afterEach, describe, expect, it, vi } from 'vitest'

import { AfipClient } from '../../afipClient'
import { AuthenticationService } from '../authentication'
import { InvoiceService } from '../invoice'
import { ParametersService } from '../parameters'

const validInvoiceData = {
  pointOfSale: 1,
  invoiceType: 6,
  totalAmount: 100,
  concept: 1,
  documentType: '80',
  documentNumber: 20123456789,
  sale: 'sale-id',
  condicionIVAReceptorId: '5'
}

const approvedResponse = {
  'soap:Envelope': {
    'soap:Body': {
      FECAESolicitarResponse: {
        FECAESolicitarResult: {
          FeCabResp: {
            Cuit: '20111111112',
            PtoVta: 1,
            CbteTipo: 6
          },
          FeDetResp: {
            FECAEDetResponse: {
              Concepto: 1,
              DocTipo: '80',
              DocNro: 20123456789,
              CbteDesde: 43,
              CbteFch: '20260415',
              CAE: 'cae-id',
              CAEFchVto: '20260425',
              Resultado: 'A'
            }
          }
        }
      }
    }
  }
}

describe('InvoiceService', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('throws when invoice data has missing required fields', async () => {
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })

    await expect(new InvoiceService().createInvoice({ pointOfSale: 1 } as never)).rejects.toThrow('Faltan los siguientes campos requeridos')
  })

  it('requests CAE and maps an approved AFIP response', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15, 12, 0, 0, 0))
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })
    vi.spyOn(ParametersService.prototype, 'getLastVoucher').mockResolvedValue(42)
    const callMethod = vi.spyOn(AfipClient.prototype, 'callMethod').mockResolvedValue(approvedResponse)

    const result = await new InvoiceService().createInvoice(validInvoiceData)

    expect(callMethod).toHaveBeenCalledWith('FECAESolicitar', expect.objectContaining({
      Auth: {
        Token: 'token',
        Sign: 'sign',
        Cuit: expect.any(String)
      },
      FeCAEReq: expect.objectContaining({
        FeCabReq: {
          CantReg: 1,
          PtoVta: 1,
          CbteTipo: 6
        }
      })
    }))
    expect(callMethod.mock.calls[0][1]).toEqual(expect.objectContaining({
      FeCAEReq: expect.objectContaining({
        FeDetReq: {
          FECAEDetRequest: [
            expect.objectContaining({
              CbteDesde: 43,
              CbteHasta: 43,
              ImpTotal: 100,
              MonId: 'PES'
            })
          ]
        }
      })
    }))
    expect(result).toEqual({
      cuit: '20111111112',
      pointOfSale: 1,
      invoiceType: 6,
      concept: 1,
      documentType: '80',
      documentNumber: 20123456789,
      invoiceNumber: 43,
      cbteFch: '20260415',
      cae: 'cae-id',
      expirationDate: '20260425',
      totalAmount: 100,
      sale: 'sale-id',
      condicionIVAReceptorId: '5',
      resultResponse: 'A'
    })
  })

  it('returns an error when AFIP rejects the invoice', async () => {
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })
    vi.spyOn(ParametersService.prototype, 'getLastVoucher').mockResolvedValue(42)
    vi.spyOn(AfipClient.prototype, 'callMethod').mockResolvedValue({
      'soap:Envelope': {
        'soap:Body': {
          FECAESolicitarResponse: {
            FECAESolicitarResult: {
              FeDetResp: {
                FECAEDetResponse: {
                  Resultado: 'R'
                }
              }
            }
          }
        }
      }
    })

    const result = await new InvoiceService().createInvoice(validInvoiceData)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('La solicitud fue rechazada')
  })

  it('returns an error when CAE data is missing', async () => {
    vi.spyOn(AuthenticationService.prototype, 'getAuth').mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expirationTime: new Date()
    })
    vi.spyOn(ParametersService.prototype, 'getLastVoucher').mockResolvedValue(42)
    vi.spyOn(AfipClient.prototype, 'callMethod').mockResolvedValue({
      'soap:Envelope': {
        'soap:Body': {
          FECAESolicitarResponse: {
            FECAESolicitarResult: {
              FeDetResp: {
                FECAEDetResponse: {
                  Resultado: 'A',
                  CAE: null,
                  CAEFchVto: null
                }
              }
            }
          }
        }
      }
    })

    const result = await new InvoiceService().createInvoice(validInvoiceData)

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('No se encontraron los campos CAE o CAEFchVto en la respuesta.')
  })
})
