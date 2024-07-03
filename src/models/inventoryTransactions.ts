import { model, Schema, Document, SchemaTypes } from 'mongoose'

export enum TransactionType {
  UP = 'UP',
  DOWN = 'DOWN'
}

export enum TransactionReason {
  BUY = 'BUY',
  SELL = 'SELL',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
  DONATION = 'DONATION',
  DEFEATED = 'DEFEATED',
  LOSS = 'LOSS',
  INTERNAL_USAGE = 'INTERNAL_USAGE'
}

export interface IInventoryTransaction extends Document {
  asset: string
  transactionType: TransactionType
  transactionReason: TransactionReason
  affectedAmount: Number
  oldQuantityAvailable: Number
  currentQuantityAvailable: Number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  sortingDate: Date
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
  transactionReason: {
    type: String,
    required: true
  },
  affectedAmount: {
    type: Number,
    required: true
  },
  oldQuantityAvailable: {
    type: Number,
    required: true
  },
  currentQuantityAvailable: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    inmutable: true,
    default: () => {
      const now = new Date().toLocaleString('es-MX', {
        timeZone: 'America/Argentina/Buenos_Aires'
      })
      const dateWithoutTime = now.split(',')[0]

      const day = dateWithoutTime.split('/')[0]
      const month = dateWithoutTime.split('/')[1]
      const year = dateWithoutTime.split('/')[2]

      const dateToSave = new Date(`${month}/${day}/${year}`)
      dateToSave.setHours(12, 0, 0, 0)

      return dateToSave
    }
  },
  updatedAt: {
    type: Date,
    default: () => {
      const now = new Date().toLocaleString('es-MX', {
        timeZone: 'America/Argentina/Buenos_Aires'
      })
      const dateWithoutTime = now.split(',')[0]

      const day = dateWithoutTime.split('/')[0]
      const month = dateWithoutTime.split('/')[1]
      const year = dateWithoutTime.split('/')[2]

      const dateToSave = new Date(`${month}/${day}/${year}`)

      dateToSave.setHours(12, 0, 0, 0)

      return dateToSave
    }
  },
  sortingDate: {
    type: Date,
    inmutable: true,
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
