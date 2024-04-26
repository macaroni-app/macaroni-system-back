import { model, Schema, Document, SchemaTypes } from 'mongoose'

export enum SaleStatus {
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface ISale extends Document {
  isRetail: boolean
  client: string
  paymentMethod: string
  total: number
  status: SaleStatus
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const saleSchema = new Schema({
  isRetail: {
    type: Boolean,
    default: false
  },
  client: {
    type: SchemaTypes.ObjectId,
    ref: 'client',
    required: true
  },
  paymentMethod: {
    type: SchemaTypes.ObjectId,
    ref: 'methodPayment',
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
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

const Sale = model<ISale>('sale', saleSchema)

export default Sale
