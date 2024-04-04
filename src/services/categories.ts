import { FilterQuery } from 'mongoose'
import Category from '../models/categories'
import { CategoryType } from '../schemas/categories'

export const categoryService = {
  getAll: (options: FilterQuery<CategoryType>) => {
    try {
      return Category.find({ ...options }).sort({ createdAt: -1 })
    } catch (error) {
      return error
    }
  },
  getOne: (options: FilterQuery<CategoryType> | undefined) => {
    try {
      return Category.findOne({ ...options })
    } catch (error) {
      return error
    }
  },
  store: (newCategory: CategoryType) => {
    try {
      return Category.create(newCategory)
    } catch (error) {
      return error
    }
  },
  delete: (id: string) => {
    try {
      return Category.deleteOne({ _id: id })
    } catch (error) {
      return error
    }
  },
  update: async (id: string, newCategoryData: CategoryType) => {
    try {
      const category = await Category.findOne({ _id: id }) as CategoryType
      category.name = newCategoryData.name

      return await Category.updateOne({ _id: id }, { $set: { ...category } })
    } catch (error) {
      return error
    }
  }
}
