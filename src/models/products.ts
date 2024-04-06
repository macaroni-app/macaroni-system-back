import { model, Schema, Document, SchemaTypes } from 'mongoose'
export interface IProduct extends Document {
  name: string
  costPrice: Number
  wholesalePrice: Number
  retailsalePrice: Number
  productType: string
  category: string
  isDeleted: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  costPrice: {
    type: Number,
    required: true
  },
  wholesalePrice: {
    type: Number,
    required: true
  },
  retailsalePrice: {
    type: Number,
    required: true
  },
  productType: {
    type: SchemaTypes.ObjectId,
    ref: 'productType',
    required: true
  },
  category: {
    type: SchemaTypes.ObjectId,
    ref: 'category',
    required: true
  },
  createdAt: {
    type: Date,
    inmutable: true,
    default: () => new Date()
  },
  updatedAt: {
    type: Date,
    default: () => new Date()
  },
  deletedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: SchemaTypes.ObjectId,
    ref: 'user',
    required: true
  },
  updatedBy: {
    type: SchemaTypes.ObjectId,
    ref: 'user',
    required: true
  }
})

const Product = model<IProduct>('product', productSchema)

export default Product
