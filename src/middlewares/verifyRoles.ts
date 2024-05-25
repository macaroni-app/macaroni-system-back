import { NextFunction, Request, Response } from 'express'

const verifyRole = (...allowedRoles: number[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    if (req.role === undefined || req.role === null) return res.sendStatus(401)

    if (req.role?.length === 0) return res.sendStatus(401)

    const rolesArray = [...allowedRoles]

    const result = rolesArray.includes(Number(req.role))

    if (result === undefined || result === null || !result) return res.sendStatus(401)
    next()
  }
}

export default verifyRole
