import { afipAuthService } from '../../services/afipAuth'

import { generateToken } from './auth/generateToken'

export class AuthenticationService {
  private readonly serviceName: string

  constructor (serviceName: string) {
    this.serviceName = serviceName
  }

  async getAuth (): Promise<{ token: string, sign: string, expirationTime: Date }> {
    // buscar token en base de datos
    const existingToken = await afipAuthService.getOne({ serviceName: this.serviceName })

    if (existingToken == null) {
      // Generar el token llamando a la función generateToken
      const { token, sign, expTime } = await generateToken(this.serviceName)
      const newAfipToken = await afipAuthService.store({ serviceName: this.serviceName, token, sign, expirationTime: expTime })

      console.log('Genero uno nuevo desde cero')

      // Retornar el token generado
      return newAfipToken
    }

    const now = new Date()

    const margin = 5 * 60 * 1000 // 5 minutos en milisegundos

    // Chequear si el token sigue siendo válido
    if (existingToken?.expirationTime.getTime() - now.getTime() <= margin) {
      // Generar el token llamando a la función generateToken
      const { token, sign, expTime } = await generateToken(this.serviceName)

      const newAfipToken = { ...existingToken._doc, token, sign, expirationTime: expTime }

      await afipAuthService.update(existingToken.serviceName, newAfipToken)

      console.log('Volvio a generar porque expiró')

      // Retornar el token generado
      return { token, sign, expirationTime: expTime }
    }

    console.log('uso el existente valido')

    return {
      token: existingToken.token,
      sign: existingToken.sign,
      expirationTime: existingToken.expirationTime
    }
  }
}
