import { model, Schema, Document, SchemaTypes } from 'mongoose'

export interface IInvoice extends Document {
  sale: string
  cuit: string
  totalAmount: number
  pointOfSale: number
  invoiceType: number
  concept: number
  documentType: string
  documentNumber: number
  invoiceNumber: number
  cbteFch: string
  cae: string
  expirationDate: string
}

const invoiceSchema = new Schema({
  sale: {
    type: SchemaTypes.ObjectId,
    ref: 'sale',
    required: true
  },
  cuit: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  pointOfSale: {
    type: Number,
    required: true
  },
  invoiceType: {
    type: Number,
    required: true
  },
  concept: {
    type: Number,
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
  invoiceNumber: {
    type: Number,
    required: true
  },
  cbteFch: {
    type: String,
    required: true
  },
  cae: {
    type: String,
    required: true,
    unique: true
  },
  expirationDate: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    inmutable: true,
    default: () => new Date()
  }
})

const Invoice = model<IInvoice>('invoice', invoiceSchema)

export default Invoice
