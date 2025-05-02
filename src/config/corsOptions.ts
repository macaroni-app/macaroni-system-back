import cors from 'cors'
import allowedOrigins from '../config/allowedOrigins'

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin ?? '') || (origin == null)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200
}

export default corsOptions
