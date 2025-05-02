import { model, Schema, Document, SchemaTypes } from 'mongoose'

export interface IBusiness extends Document {
  name: string
  cuit: string
  address: string
  ivaCondition: string
  isDeleted: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const businessSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  ivaCondition: {
    type: String,
    required: true
  },
  cuit: {
    type: String,
    required: true
  },
  address: {
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

const Business = model<IBusiness>('business', businessSchema)

export default Business
