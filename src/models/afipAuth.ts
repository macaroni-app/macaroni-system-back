import { model, Schema, Document } from 'mongoose'

export interface IAfipAuth extends Document {
  serviceName: string
  token: string
  sign: string
  expirationTime: Date
  createdAt: Date
}

const afipAuthSchema = new Schema({
  serviceName: {
    type: String,
    required: true,
    unique: true
  },
  token: {
    type: String,
    required: true
  },
  sign: {
    type: String,
    required: true
  },
  expirationTime: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    inmutable: true,
    default: () => new Date()
  }
})

const AfipAuth = model<IAfipAuth>('afipAuth', afipAuthSchema)

export default AfipAuth
