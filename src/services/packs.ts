import { FilterQuery } from 'mongoose'
import Pack from '../models/packs'
import { PackType } from '../schemas/packs'

export const packsService = {
  getAll: (options: FilterQuery<PackType>) => {
    try {
      return Pack.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<PackType>) => {
    try {
      return Pack.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newPack: PackType) => {
    try {
      return Pack.create(newPack)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return Pack.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newPackData: PackType) => {
    try {
      const pack = await Pack.findOne({ _id: id }) as PackType
      pack.name = newPackData?.name
      pack.costPrice = newPackData?.costPrice
      pack.salePrice = newPackData?.salePrice

      return await Pack.updateOne({ _id: id }, { $set: { ...pack } })
      // return await pack.save()
    } catch (error) {
      return error
    }
  }
  // updateMany: async (packsToUpdate: IPack[]) => {
  //   try {
  //     const packsIds = packsToUpdate?.map((pack) => pack.id)

  //     const res = await Pack.find({
  //       _id: { $in: packsIds }
  //     })

  //     const packs: IPack[] = []
  //     res.forEach((packToUpdate) => {
  //       packsToUpdate.forEach((pack) => {
  //         if (packToUpdate.id === pack.id) {
  //           packs.push(packToUpdate)
  //         }
  //       })
  //     })

  //     let data
  //     if (packs.length > 0) {
  //       data = await Pack.bulkSave(packs)
  //     }
  //     return data
  //   } catch (error) {
  //     return error
  //   }
  // }
}
