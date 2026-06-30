import { model, Schema, Document, SchemaTypes } from 'mongoose'

export enum ProductItemSelectionType {
  FIXED = 'FIXED',
  VARIANT_SELECTION = 'VARIANT_SELECTION'
}

export interface IProductItem extends Document {
  _id: string
  asset?: string
  baseAsset?: string
  selectionType: ProductItemSelectionType
  allowedVariantValues?: string[]
  product: string
  quantity: Number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  createdBy: string
  updatedBy: string
}

const productItemSchema = new Schema({
  asset: {
    type: SchemaTypes.ObjectId,
    ref: 'asset',
    required: false
  },
  baseAsset: {
    type: SchemaTypes.ObjectId,
    ref: 'asset'
  },
  selectionType: {
    type: String,
    enum: Object.values(ProductItemSelectionType),
    default: ProductItemSelectionType.FIXED
  },
  allowedVariantValues: {
    type: [{
      type: SchemaTypes.ObjectId,
      ref: 'variantAttributeValue'
    }],
    default: []
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

productItemSchema.pre('validate', function (next) {
  if (this.selectionType === ProductItemSelectionType.VARIANT_SELECTION) {
    if (this.baseAsset == null) {
      this.invalidate('baseAsset', 'El insumo base es obligatorio para componentes con variantes.')
    }
  } else if (this.asset == null) {
    this.invalidate('asset', 'El insumo es obligatorio para componentes fijos.')
  }

  next()
})

const ProductItem = model<IProductItem>('productItem', productItemSchema)

export default ProductItem
