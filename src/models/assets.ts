import { model, Schema, Document, SchemaTypes } from 'mongoose'

export interface IAsset extends Document {
  name: string
  category: string
  isDeleted: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const assetSchema = new Schema({
  name: {
    type: String,
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

const Asset = model<IAsset>('asset', assetSchema)

export default Asset
