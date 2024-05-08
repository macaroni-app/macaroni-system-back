import { model, Schema, Document } from 'mongoose'

export interface IRole extends Document {
  name: string
  code: number
}

const roleSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: Number,
    required: true
  }
}, { versionKey: false })

const Role = model<IRole>('role', roleSchema)

export default Role
