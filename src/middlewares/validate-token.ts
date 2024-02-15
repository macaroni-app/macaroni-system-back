import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { ACCESS_DENIED } from '../labels/labels'

export interface UserPayload {
  firstName: string
  lastName: string
  email: string
  id: string
}

const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const authHeader = req.headers.authorization

  if (authHeader == null) return res.sendStatus(401)
  const token = authHeader.split(' ')[1]

  if (token.length === 0) {
    return res.status(401).json({
      status: 401,
      message: ACCESS_DENIED
    })
  }

  try {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? ''
    const verified = jwt.verify(token, ACCESS_TOKEN_SECRET) as UserPayload
    req.user = verified
    next()
  } catch (error) {
    return res.sendStatus(403)
  }
}

export default verifyToken
