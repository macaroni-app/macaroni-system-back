import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodError } from 'zod'

export const schemaValidator =
  (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        schema.parse({
          body: req.body,
          params: req.params,
          query: req.query
        })
        next()
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json(
            error.issues.map((issue) => ({
              path: issue.path,
              message: issue.message
            }))
          )
        }
        return res.status(400).json({ message: 'internal server error' })
      }
    }
