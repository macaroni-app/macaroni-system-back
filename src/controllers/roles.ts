import { Request, Response } from 'express'
import { roleService } from '../services/roles'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateRoleBodyType, DeleteRoleParamsType, GetRoleParamsType, GetRoleQueryType, RoleType, UpdateRoleBodyType, UpdateRoleParamsType } from '../schemas/roles'

const rolesController = {
  getAll: async (req: Request<{}, {}, {}, GetRoleQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const roles: RoleType[] = await roleService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: roles.length,
      data: roles
    })
  },
  getOne: async (req: Request<GetRoleParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const role: RoleType = await roleService.getOne({ _id: id })

    if (role === null || role === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: role
    })
  },
  store: async (req: Request<{}, {}, CreateRoleBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined || req.body.code === null || req.body.code === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const roleToStore = { ...req.body }

    const roleStored: RoleType = await roleService.store(roleToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: roleStored
    })
  },
  delete: async (req: Request<DeleteRoleParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const roleDeleted = await roleService.delete(id)

    if (roleDeleted === null || roleDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: roleDeleted
    })
  },
  update: async (req: Request<UpdateRoleParamsType, {}, UpdateRoleBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined || req.body.code === null || req.body.code === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldRole = await roleService.getOne({ _id: id })

    if (oldRole === null || oldRole === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newRoleData = { ...oldRole._doc, ...req.body }

    const rolesUpdated = await roleService.update(id, newRoleData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: rolesUpdated
    })
  }
}

export default rolesController
