// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from 'express'
import { UserPayload } from '../../middlewares/validate-token'

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
      roles?: string[]
    }
  }
}
