import { model, Schema, Document, SchemaTypes } from 'mongoose'

export interface IOrderRequestItem extends Document {
  orderRequest: string
  product: string
  quantity: number
  unitPrice: number
  subtotal: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const orderRequestItemSchema = new Schema({
  orderRequest: {
    type: SchemaTypes.ObjectId,
    ref: 'orderRequest',
    required: true
  },
  product: {
    type: SchemaTypes.ObjectId,
    ref: 'product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  subtotal: {
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

const OrderRequestItem = model<IOrderRequestItem>('orderRequestItem', orderRequestItemSchema)

export default OrderRequestItem
