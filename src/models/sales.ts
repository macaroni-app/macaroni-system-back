import { model, Schema, Document, SchemaTypes } from 'mongoose'

export enum SaleStatus {
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface ISale extends Document {
  isRetail: boolean
  client: string
  paymentMethod: string
  costTotal: number
  total: number
  discount: number
  status: SaleStatus
  business: string
  isBilled: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  sortingDate: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const saleSchema = new Schema({
  isRetail: {
    type: Boolean,
    default: false
  },
  client: {
    type: SchemaTypes.ObjectId,
    ref: 'client',
    required: true
  },
  business: {
    type: SchemaTypes.ObjectId,
    ref: 'business',
    required: true
  },
  isBilled: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: SchemaTypes.ObjectId,
    ref: 'methodPayment',
    required: true
  },
  costTotal: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
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

const Sale = model<ISale>('sale', saleSchema)

export default Sale
