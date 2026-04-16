import { describe, expect, it, vi } from 'vitest'

import { processToken } from '../processToken'

const buildValidResponseXml = () => `
  <soapenv:Envelope>
    <soapenv:Body>
      <loginCmsResponse>
        <loginCmsReturn>
          <![CDATA[
            <loginTicketResponse>
              <header>
                <expirationTime>2026-04-15T12:30:00.000-03:00</expirationTime>
              </header>
              <credentials>
                <token>token-value</token>
                <sign>sign-value</sign>
              </credentials>
            </loginTicketResponse>
          ]]>
        </loginCmsReturn>
      </loginCmsResponse>
    </soapenv:Body>
  </soapenv:Envelope>
`

describe('processToken', () => {
  it('extracts token, sign and expiration time from WSAA XML', async () => {
    const result = await processToken(buildValidResponseXml())

    expect(result).toEqual({
      token: 'token-value',
      sign: 'sign-value',
      expTime: '2026-04-15T12:30:00.000-03:00'
    })
  })

  it('throws when SOAP envelope is missing', async () => {
    await expect(processToken('<invalid></invalid>')).rejects.toThrow('No se encontró la etiqueta "soapenv:Envelope"')
  })

  it('throws when credentials are missing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const xml = `
      <soapenv:Envelope>
        <soapenv:Body>
          <loginCmsResponse>
            <loginCmsReturn>
              <![CDATA[
                <loginTicketResponse>
                  <header>
                    <expirationTime>2026-04-15T12:30:00.000-03:00</expirationTime>
                  </header>
                </loginTicketResponse>
              ]]>
            </loginCmsReturn>
          </loginCmsResponse>
        </soapenv:Body>
      </soapenv:Envelope>
    `

    await expect(processToken(xml)).rejects.toThrow('No se encontraron las credenciales')
    consoleError.mockRestore()
  })

  it('throws when token or sign are missing', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const xml = `
      <soapenv:Envelope>
        <soapenv:Body>
          <loginCmsResponse>
            <loginCmsReturn>
              <![CDATA[
                <loginTicketResponse>
                  <header>
                    <expirationTime>2026-04-15T12:30:00.000-03:00</expirationTime>
                  </header>
                  <credentials>
                    <token>token-value</token>
                  </credentials>
                </loginTicketResponse>
              ]]>
            </loginCmsReturn>
          </loginCmsResponse>
        </soapenv:Body>
      </soapenv:Envelope>
    `

    await expect(processToken(xml)).rejects.toThrow('Faltan el token o la firma')
    consoleError.mockRestore()
  })
})
