import { model, Schema, Document, SchemaTypes } from 'mongoose'
export interface ISaleItem extends Document {
  sale: string
  product: string
  pack: string
  quantity: number
  subtotal: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const saleItemSchema = new Schema({
  sale: {
    type: SchemaTypes.ObjectId,
    ref: 'sale',
    required: true
  },
  product: {
    type: SchemaTypes.ObjectId,
    ref: 'product'
  },
  pack: {
    type: SchemaTypes.ObjectId,
    ref: 'pack'
  },
  quantity: {
    type: Number,
    required: true
  },
  subtotal: {
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

const SaleItem = model<ISaleItem>('saleItems', saleItemSchema)

export default SaleItem
