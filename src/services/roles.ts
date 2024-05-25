import { FilterQuery } from 'mongoose'
import Role from '../models/roles'
import { RoleType } from '../schemas/roles'

export const roleService = {
  getAll: (options: FilterQuery<RoleType>) => {
    try {
      return Role.find({ ...options })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<RoleType> | undefined) => {
    try {
      return Role.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newRole: RoleType) => {
    try {
      return Role.create(newRole)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return Role.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newRoleData: RoleType) => {
    try {
      const role = await Role.findOne({ _id: id }) as RoleType
      role.name = newRoleData.name
      role.code = newRoleData.code

      return await Role.updateOne({ _id: id }, { $set: { ...role } })
    } catch (error) {
      return error
    }
  }
}
