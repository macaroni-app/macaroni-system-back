import * as soap from 'soap'
import { parseStringPromise } from 'xml2js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AfipClient } from '../afipClient'

vi.mock('soap', () => ({
  createClientAsync: vi.fn()
}))

vi.mock('xml2js', () => ({
  parseStringPromise: vi.fn()
}))

describe('AfipClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('inicializa el cliente SOAP una sola vez', async () => {
    vi.mocked(soap.createClientAsync).mockResolvedValue({
      FEParamGetTiposDocAsync: vi.fn().mockResolvedValue([{ ok: true }, '<xml />'])
    } as any)
    vi.mocked(parseStringPromise).mockResolvedValue({ parsed: true } as any)
    vi.spyOn(console, 'log').mockImplementation(() => {})

    const client = new AfipClient()

    await client.initClient()
    await client.initClient()

    expect(soap.createClientAsync).toHaveBeenCalledTimes(1)
  })

  it('informa un error claro si no puede crear el cliente SOAP', async () => {
    vi.mocked(soap.createClientAsync).mockRejectedValue(new Error('wsdl error'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const client = new AfipClient()

    await expect(client.initClient()).rejects.toThrow('No se pudo inicializar el cliente SOAP')
  })

  it('rechaza si el metodo SOAP solicitado no existe', async () => {
    vi.mocked(soap.createClientAsync).mockResolvedValue({} as any)
    vi.spyOn(console, 'log').mockImplementation(() => {})

    const client = new AfipClient()

    await expect(client.callMethod('FEParamGetTiposDoc', {})).rejects.toThrow(
      "El método 'FEParamGetTiposDocAsync' no está definido en el cliente SOAP. Revisa el WSDL."
    )
  })

  it('llama al metodo SOAP y devuelve el XML parseado', async () => {
    const method = vi.fn().mockResolvedValue([{ plain: true }, '<soap>ok</soap>'])
    vi.mocked(soap.createClientAsync).mockResolvedValue({
      FEParamGetTiposDocAsync: method
    } as any)
    vi.mocked(parseStringPromise).mockResolvedValue({ parsed: true } as any)
    vi.spyOn(console, 'log').mockImplementation(() => {})

    const client = new AfipClient()
    const result = await client.callMethod('FEParamGetTiposDoc', { Auth: { Token: 'token' } })

    expect(method).toHaveBeenCalledWith({ Auth: { Token: 'token' } })
    expect(parseStringPromise).toHaveBeenCalledWith('<soap>ok</soap>', { explicitArray: false })
    expect(result).toEqual({ parsed: true })
  })

  it('devuelve el JSON plano si no puede parsear el XML', async () => {
    const plainResponse = { FEParamGetTiposDocResult: { ResultGet: { DocTipo: [] } } }
    vi.mocked(soap.createClientAsync).mockResolvedValue({
      FEParamGetTiposDocAsync: vi.fn().mockResolvedValue([plainResponse, '<soap>bad</soap>'])
    } as any)
    vi.mocked(parseStringPromise).mockRejectedValue(new Error('xml error'))
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const client = new AfipClient()
    const result = await client.callMethod('FEParamGetTiposDoc', {})

    expect(result).toEqual(plainResponse)
    expect(console.warn).toHaveBeenCalledWith('No se pudo parsear la respuesta como XML. Se devolverá JSON plano.')
  })

  it('rechaza respuestas SOAP vacias o mal formadas', async () => {
    vi.mocked(soap.createClientAsync).mockResolvedValue({
      FEParamGetTiposDocAsync: vi.fn().mockResolvedValue([])
    } as any)
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const client = new AfipClient()

    await expect(client.callMethod('FEParamGetTiposDoc', {})).rejects.toThrow(
      'Respuesta SOAP inesperada: el array está vacío o mal formado.'
    )
  })
})
