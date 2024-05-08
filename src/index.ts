import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import corsOptions from './config/corsOptions'
import './database'

import { createRoles } from './libs/initialSetup'

// import routes
import usersRouter from './routes/users'
import assetsRouter from './routes/assets'
import productsRouter from './routes/products'
import productItemsRouter from './routes/productItems'
import inventoriesRouter from './routes/inventories'
import inventoryTransactionRouter from './routes/inventoryTransactions'
import salesRouter from './routes/sales'
import clientsRouter from './routes/clients'
import categoriesRouter from './routes/categories'
import productTypesRouter from './routes/productTypes'
import methodPaymentRouter from './routes/paymentMethods'
import saleItemsRouter from './routes/saleItems'

// middlewares
import credentials from './middlewares/credentials'

// app instance
const app = express()

// creating roles if there isnt
void createRoles()

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials)

app.use(cors(corsOptions))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cookieParser())

app.use(morgan('tiny'))

// route middleware
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/assets', assetsRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/productItems', productItemsRouter)
app.use('/api/v1/inventories', inventoriesRouter)
app.use('/api/v1/inventoryTransactions', inventoryTransactionRouter)
app.use('/api/v1/sales', salesRouter)
app.use('/api/v1/saleItems', saleItemsRouter)
app.use('/api/v1/clients', clientsRouter)
app.use('/api/v1/categories', categoriesRouter)
app.use('/api/v1/productTypes', productTypesRouter)
app.use('/api/v1/methodPayments', methodPaymentRouter)

// app server listening
const PORT = process.env.PORT ?? 3001
app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
)

export default app
