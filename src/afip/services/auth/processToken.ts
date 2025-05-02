import { parseStringPromise } from 'xml2js'

export const processToken = async (
  taXml: string
): Promise<{ token: string, sign: string, expTime: Date }> => {
  try {
    // Parseamos el XML inicial
    const parsedXml = await parseStringPromise(taXml)

    // Validamos la estructura de `parsedXml`
    const envelope = parsedXml?.['soapenv:Envelope']
    if (envelope === undefined || envelope === null) throw new Error('No se encontró la etiqueta "soapenv:Envelope" en el XML.')

    const body = envelope['soapenv:Body']?.[0]
    if (body === undefined || body === null) throw new Error('No se encontró la etiqueta "soapenv:Body" en el XML.')

    const loginCmsResponse = body.loginCmsResponse?.[0]
    if (loginCmsResponse === undefined || loginCmsResponse === null) throw new Error('No se encontró la etiqueta "loginCmsResponse" en el XML.')

    const loginCmsReturn = loginCmsResponse.loginCmsReturn?.[0]
    if (loginCmsReturn === undefined || loginCmsReturn === null) throw new Error('No se encontró el campo "loginCmsReturn" en el XML.')

    // Parseamos el XML dentro de `loginCmsReturn`
    const innerXml = await parseStringPromise(loginCmsReturn)

    // Extraemos las credenciales y la fecha de expiración
    const credentials = innerXml?.loginTicketResponse?.credentials?.[0]
    if (credentials === undefined || credentials === null) throw new Error('No se encontraron las credenciales en el loginTicketResponse.')

    const token = credentials.token?.[0]
    const sign = credentials.sign?.[0]

    if ((token === undefined || token === null) || (sign === undefined || sign === null)) {
      throw new Error('Faltan el token o la firma en las credenciales.')
    }

    const expirationTime = innerXml?.loginTicketResponse?.header?.[0]?.expirationTime?.[0]
    if (expirationTime === undefined || expirationTime === null) {
      throw new Error('No se encontró el campo "expirationTime" en el XML.')
    }

    return { token, sign, expTime: expirationTime }
  } catch (error) {
    console.error('Error procesando el token:', error.message)
    throw error
  }
}
