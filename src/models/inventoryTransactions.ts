import { model, Schema, Document, SchemaTypes } from 'mongoose'

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}
export interface IInventoryTransaction extends Document {
  asset: string
  transactionType: TransactionType
  affectedAmount: Number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const inventoryTransactionSchema = new Schema({
  asset: {
    type: SchemaTypes.ObjectId,
    ref: 'asset',
    required: true
  },
  transactionType: {
    type: String,
    required: true
  },
  affectedAmount: {
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

const InventoryTransaction = model<IInventoryTransaction>(
  'inventoryTransaction',
  inventoryTransactionSchema
)

export default InventoryTransaction
