import { model, Schema, Document, SchemaTypes } from 'mongoose'

export enum OrderRequestStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  CONVERTED = 'CONVERTED'
}

export enum OrderRequestPaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID'
}

interface IOrderRequestReservedItem {
  inventory: string
  asset: string
  quantity: number
}

export interface IOrderRequestPayment {
  amount: number
  paymentMethod: string
  createdAt: Date
  createdBy: string
  note?: string
}

export interface IOrderRequest extends Document {
  orderCode?: string
  isRetail: boolean
  client: string
  business?: string
  total: number
  discount: number
  payments: IOrderRequestPayment[]
  paidAmount: number
  pendingAmount: number
  paymentStatus: OrderRequestPaymentStatus
  status: OrderRequestStatus
  convertedSale?: string
  reservedItems: IOrderRequestReservedItem[]
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  sortingDate: Date
  deletedAt: Date
  confirmedAt?: Date
  cancelledAt?: Date
  convertedAt?: Date
  createdBy: string
  updatedBy: string
}

const orderRequestSchema = new Schema({
  orderCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
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
    ref: 'business'
  },
  total: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  payments: {
    type: [{
      amount: {
        type: Number,
        required: true
      },
      paymentMethod: {
        type: SchemaTypes.ObjectId,
        ref: 'methodPayment',
        required: true
      },
      createdAt: {
        type: Date,
        default: () => new Date()
      },
      createdBy: {
        type: SchemaTypes.ObjectId,
        ref: 'user',
        required: true
      },
      note: {
        type: String
      }
    }],
    default: []
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    default: OrderRequestPaymentStatus.UNPAID
  },
  status: {
    type: String,
    required: true,
    default: OrderRequestStatus.DRAFT
  },
  convertedSale: {
    type: SchemaTypes.ObjectId,
    ref: 'sale'
  },
  reservedItems: {
    type: [{
      inventory: {
        type: SchemaTypes.ObjectId,
        ref: 'inventory',
        required: true
      },
      asset: {
        type: SchemaTypes.ObjectId,
        ref: 'asset',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }],
    default: []
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
  confirmedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  convertedAt: {
    type: Date
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

const OrderRequest = model<IOrderRequest>('orderRequest', orderRequestSchema)

export default OrderRequest
