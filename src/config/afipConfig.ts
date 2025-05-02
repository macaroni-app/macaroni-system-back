export const afipConfig = {
  cuit: process.env.AFIP_CUIT ?? '23393153504',
  certPath: '../../../../certificates/certificado.crt',
  keyPath: '../../../../certificates/MiClavePrivada.key',
  wsfeUrl: process.env.AFIP_ENV === 'production'
    ? 'https://servicios1.afip.gov.ar/wsfev1/service.asmx?WSDL'
    : 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx?WSDL'
}
