import { Document, model, Schema } from 'mongoose'

export interface ICounter extends Document {
  key: string
  sequence: number
}

const counterSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  sequence: {
    type: Number,
    required: true,
    default: 0
  }
})

const Counter = model<ICounter>('counter', counterSchema)

export default Counter
