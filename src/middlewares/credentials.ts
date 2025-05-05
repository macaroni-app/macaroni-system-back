import { Request, Response, NextFunction } from 'express'
import allowedOrigins from '../config/allowedOrigins'

const credentials = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin ?? '')) {
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    next()
  }
  // const origin = req.headers.origin
  // if (allowedOrigins.includes(origin ?? '')) {
  //   res.setHeader('Access-Control-Allow-Credentials', 'true')
  //   res.setHeader('Access-Control-Allow-Origin', origin) // 🔴 ¡esto es clave!
  // }
  // next()
}

export default credentials
