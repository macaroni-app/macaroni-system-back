import { NextFunction, Request, Response } from 'express'
import Role from '../models/roles'

const verifyRole = (...allowedRoles: number[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    if (req.roles === undefined || req.roles === null) return res.sendStatus(401)

    const roles = await Role.find({ _id: { $in: req.roles } })

    const roleCodes = roles.map(role => role.code)

    if (roleCodes?.length === 0) return res.sendStatus(401)

    const rolesArray = [...allowedRoles]

    const result = roleCodes.map(roleCode => rolesArray.includes(roleCode)).find(val => val)
    if (result === undefined || result === null || !result) return res.sendStatus(401)
    next()
  }
}

export default verifyRole
