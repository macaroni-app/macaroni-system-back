import { FilterQuery } from 'mongoose'
import Business from '../models/business'
import { BusinessType } from '../schemas/business'

export const businessService = {
  getAll: (options: FilterQuery<BusinessType>) => {
    try {
      return Business.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<BusinessType> | undefined) => {
    try {
      return Business.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newBusiness: BusinessType) => {
    try {
      return Business.create(newBusiness)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return Business.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newBusinessData: BusinessType) => {
    try {
      const business = await Business.findOne({ _id: id }) as BusinessType
      business.name = newBusinessData.name
      business.cuit = newBusinessData.cuit
      business.ivaCondition = newBusinessData.ivaCondition
      business.address = newBusinessData.address

      return await Business.updateOne({ _id: id }, { $set: { ...business } })
      // return await client.save()
    } catch (error) {
      return error
    }
  },
  updateIsActive: async (id: string, isActive: boolean) => {
    try {
      const business = await Business.findOne({ _id: id }) as BusinessType
      business.isActive = isActive

      return await Business.updateOne({ _id: id }, { $set: { ...business } })
    } catch (error) {
      return error
    }
  }
}
