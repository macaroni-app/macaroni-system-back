import { model, Schema, Document, SchemaTypes } from 'mongoose'

export interface IPackItem extends Document {
  product: string
  pack: string
  quantity: Number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const packItemSchema = new Schema({
  product: {
    type: SchemaTypes.ObjectId,
    ref: 'product',
    required: true
  },
  pack: {
    type: SchemaTypes.ObjectId,
    ref: 'pack',
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

const PackItem = model<IPackItem>('packItem', packItemSchema)

export default PackItem
