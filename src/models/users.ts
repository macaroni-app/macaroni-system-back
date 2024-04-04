import { model, Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  firstName: string
  lastName: string
  password: string
  email: string
  refreshToken: string
  isDeleted: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    min: 3,
    max: 255
  },
  lastName: {
    type: String,
    required: true,
    min: 2,
    max: 255
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 1024
  },
  refreshToken: { type: String, default: '' },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    inmutable: true,
    default: () => new Date().toLocaleDateString()
  },
  updatedAt: {
    type: Date,
    default: () => new Date().toLocaleDateString()
  },
  deletedAt: {
    type: Date
  }
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const jumps = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(this.password, jumps)

  this.password = hash

  next()
})

userSchema.methods.isValidPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password)
}

const User = model<IUser>('user', userSchema)

export default User
