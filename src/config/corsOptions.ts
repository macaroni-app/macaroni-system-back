import cors from 'cors'
import allowedOrigins from '../config/allowedOrigins'

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if ((origin == null) || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

export default corsOptions
