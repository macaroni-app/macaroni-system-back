import { FilterQuery } from 'mongoose'
import User, { IUser } from '../models/users'

export const userService = {
  getAll: () => {
    try {
      return User.find({})
    } catch (error) {
      return error
    }
  },
  getOne: (credentials: FilterQuery<IUser> | undefined) => {
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

      return await anUser.save()
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newUserData: IUser) => {
    try {
      const data = await User.updateOne({ _id: id }, newUserData)

      return data.modifiedCount
    } catch (error) {
      return error
    }
  }
}
