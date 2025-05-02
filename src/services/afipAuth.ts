import { FilterQuery } from 'mongoose'
import AfipAuth from '../models/afipAuth'

interface IAfipAuth {
  serviceName: string
  token: string
  sign: string
  expirationTime: Date
}

export const afipAuthService = {
  getOne: (options: FilterQuery<IAfipAuth>) => {
    try {
      return AfipAuth.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newAfipAuth: IAfipAuth) => {
    try {
      return AfipAuth.create(newAfipAuth)
    } catch (error) {
      return error
    }
  },
  update: async (serviceName: string, newAfipAuth: IAfipAuth) => {
    try {
      const afipAuth = await AfipAuth.findOne({ serviceName }) as IAfipAuth
      afipAuth.token = newAfipAuth.token
      afipAuth.sign = newAfipAuth.sign
      afipAuth.expirationTime = newAfipAuth.expirationTime

      return await AfipAuth.updateOne({ serviceName }, { $set: { ...afipAuth } })
    } catch (error) {
      return error
    }
  }
}
