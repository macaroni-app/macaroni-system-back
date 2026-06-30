import { model, Schema, Document, SchemaTypes } from 'mongoose'

export interface IVariantAttributeValue extends Document {
  name: string
  attribute: string
  isDeleted: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const variantAttributeValueSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  attribute: {
    type: SchemaTypes.ObjectId,
    ref: 'variantAttribute',
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

const VariantAttributeValue = model<IVariantAttributeValue>('variantAttributeValue', variantAttributeValueSchema)

export default VariantAttributeValue
