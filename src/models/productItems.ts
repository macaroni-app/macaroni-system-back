import { model, Schema, Document, SchemaTypes } from 'mongoose'

export interface IProductItem extends Document {
  _id: string
  asset: string
  product: string
  quantity: Number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const productItemSchema = new Schema({
  asset: {
    type: SchemaTypes.ObjectId,
    ref: 'asset',
    required: true
  },
  product: {
    type: SchemaTypes.ObjectId,
    ref: 'product',
    required: true
  },
  quantity: {
    type: Number,
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

const ProductItem = model<IProductItem>('productItem', productItemSchema)

export default ProductItem
