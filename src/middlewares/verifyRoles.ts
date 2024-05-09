import { NextFunction, Request, Response } from 'express'

const verifyRole = (...allowedRoles: number[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    if (req.roles === undefined || req.roles === null) return res.sendStatus(401)

    if (req.roles?.length === 0) return res.sendStatus(401)

    const rolesArray = [...allowedRoles]

    const result = req.roles.map(roleCode => rolesArray.includes(Number(roleCode))).find(val => val)
    if (result === undefined || result === null || !result) return res.sendStatus(401)
    next()
  }
}

export default verifyRole
