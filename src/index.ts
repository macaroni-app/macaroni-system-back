import express from 'express'
// import bodyParser from 'body-parser'
// import cors from 'cors'
// import cookieParser from 'cookie-parser'
import morgan from 'morgan'
// import corsOptions from './config/corsOptions.js'
import './database'

// import routes
// import usersRouter from "./routes/users.js";
// import productsRouter from "./routes/products.js";
// import salesRouter from "./routes/sales.js";
// import categoriesRouter from "./routes/categories.js";
// import clientsRouter from "./routes/clients.js";
// import saleDetailsRouter from "./routes/saleDetails.js";
// import debtsRouter from "./routes/debts.js";
// import methodPaymentRouter from "./routes/methodPayments.js";

// middlewares
// import credentials from "./middlewares/credentials.js";

// app instance
const app = express()

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
// app.use(credentials);

// app.use(cors(corsOptions));

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// app.use(cookieParser());

app.use(morgan('tiny'))

// // route middleware
// app.use("/api/v1/users", usersRouter);
// app.use("/api/v1/products", productsRouter);
// app.use("/api/v1/sales", salesRouter);
// app.use("/api/v1/categories", categoriesRouter);
// app.use("/api/v1/clients", clientsRouter);
// app.use("/api/v1/saleDetails", saleDetailsRouter);
// app.use("/api/v1/debts", debtsRouter);
// app.use("/api/v1/methodPayments", methodPaymentRouter);

// app server listening
const PORT = process.env.PORT ?? 3001
app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
)

export default app
