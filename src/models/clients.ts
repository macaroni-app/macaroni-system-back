import { model, Schema, Document, SchemaTypes } from 'mongoose'

export interface IClient extends Document {
  name: string
  condicionIVAReceptorId: string
  documentType: string
  documentNumber: number
  address: string
  isDeleted: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const clientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  condicionIVAReceptorId: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  documentNumber: {
    type: Number,
    required: true
  },
  address: {
    type: String
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

const Client = model<IClient>('client', clientSchema)

export default Client
