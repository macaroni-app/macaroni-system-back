import path from 'path'

export const afipConfig = {
  cuit: process.env.AFIP_CUIT ?? '23393153504',
  certPath: '../../../../certificates/certificado.crt',
  keyPath: '../../../../certificates/MiClavePrivada.key',
  wsfeUrl: process.env.AFIP_ENV === 'production'
    ? path.resolve(__dirname, '../afip/wsfev1.wsdl')
    : path.resolve(__dirname, '../afip/wsfehomo.wsdl')
}
