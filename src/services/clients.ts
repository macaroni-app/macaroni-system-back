import { FilterQuery } from 'mongoose'
import Client from '../models/clients'
import { ClientType } from '../schemas/clients'

export const clientService = {
  getAll: (options: FilterQuery<ClientType>) => {
    try {
      return Client.find({ ...options }, ['name']).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<ClientType> | undefined) => {
    try {
      return Client.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newClient: ClientType) => {
    try {
      return Client.create(newClient)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return Client.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newClientData: ClientType) => {
    try {
      const client = await Client.findOne({ _id: id }) as ClientType
      client.name = newClientData.name

      return await Client.updateOne({ _id: id }, { $set: { ...client } })
      // return await client.save()
    } catch (error) {
      return error
    }
  }
}
