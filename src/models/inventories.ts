import { model, Schema, Document, SchemaTypes } from 'mongoose'
export interface IInventory extends Document {
  asset: string
  quantityAvailable: Number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const inventorySchema = new Schema({
  asset: {
    type: SchemaTypes.ObjectId,
    ref: 'asset',
    required: true
  },
  quantityAvailable: {
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

const Inventory = model<IInventory>('inventory', inventorySchema)

export default Inventory
