import { FilterQuery } from 'mongoose'
import Client, { IClient } from '../models/clients'

export const clientService = {
  getAll: (options: FilterQuery<IClient>) => {
    try {
      return Client.find({ ...options }, ['name']).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<IClient> | undefined) => {
    try {
      return Client.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newClient: IClient) => {
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
  update: async (id: string, newClientData: IClient) => {
    try {
      const client = await Client.findOne({ _id: id }) as IClient
      client.name = newClientData.name

      return await client.save()
    } catch (error) {
      return error
    }
  }
}
