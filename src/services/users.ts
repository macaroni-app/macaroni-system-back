import { FilterQuery } from 'mongoose'
import User, { IUser } from '../models/users'
import { UserType } from '../schemas/users'

export const userService = {
  getAll: () => {
    try {
      return User.find({ }).select('_id firstName lastName email createdAt isActive').populate({ path: 'roles', select: 'name' }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (credentials: FilterQuery<UserType> | undefined) => {
    try {
      return User.findOne({ ...credentials })
    } catch (error) {
      return error
    }
  },
  store: async (newUser: IUser) => {
    try {
      const anUser = new User()
      anUser.firstName = newUser.firstName
      anUser.lastName = newUser.lastName
      anUser.password = newUser.password
      anUser.email = newUser.email
      anUser.roles = newUser.roles

      return await anUser.save()
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return User.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newUserData: UserType) => {
    try {
      const data = await User.updateOne({ _id: id }, newUserData)

      return data.modifiedCount
    } catch (error) {
      return error
    }
  },
  updateIsActive: async (id: string, isActive: boolean) => {
    try {
      const user = await User.findOne({ _id: id }) as UserType
      user.isActive = isActive

      return await User.updateOne({ _id: id }, { $set: { ...user } })
    } catch (error) {
      return error
    }
  }
}
