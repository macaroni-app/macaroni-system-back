import { model, Schema, Document, SchemaTypes } from 'mongoose'

export interface IAssetVariant extends Document {
  name: string
  baseAsset: string
  values: string[]
  sku?: string
  costPrice?: number
  isDeleted: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const assetVariantSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  baseAsset: {
    type: SchemaTypes.ObjectId,
    ref: 'asset',
    required: true
  },
  values: {
    type: [{
      type: SchemaTypes.ObjectId,
      ref: 'variantAttributeValue',
      required: true
    }],
    default: []
  },
  sku: {
    type: String
  },
  costPrice: {
    type: Number
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

const AssetVariant = model<IAssetVariant>('assetVariant', assetVariantSchema)

export default AssetVariant
