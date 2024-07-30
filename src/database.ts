import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const USER = process.env.USER ?? ''
const PASSWORD = process.env.PASSWORD ?? ''
const DBNAME = process.env.DBNAME ?? ''
const CLUSTER_NAME = process.env.CLUSTER_NAME ?? ''

// DB Connection -
mongoose.set('strictQuery', false)
const uri = `mongodb+srv://${USER}:${PASSWORD}@cluster0.${CLUSTER_NAME}.mongodb.net/${DBNAME}?retryWrites=true&w=majority`
mongoose
  .connect(uri)
  .then(() => console.log('DB Connection OK'))
  .catch((error) => console.log('error db: ', error))
