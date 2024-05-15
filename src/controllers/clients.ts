import { Request, Response } from 'express'
import { clientService } from '../services/clients'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { ClientType, CreateClientBodyType, ChangeIsActiveClientParamsType, ChangeIsActiveClientBodyType, DeleteClientParamsType, GetClientParamsType, GetClientQueryType, UpdateClientBodyType, UpdateClientParamsType } from '../schemas/clients'

const clientsController = {
  getAll: async (req: Request<{}, {}, {}, GetClientQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const clients: ClientType[] = await clientService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: clients.length,
      data: clients
    })
  },
  getOne: async (req: Request<GetClientParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const client: ClientType = await clientService.getOne({ _id: id })

    if (client === null || client === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: client
    })
  },
  store: async (req: Request<{}, {}, CreateClientBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const clientToStore = { ...req.body }
    clientToStore.createdBy = req?.user?.id
    clientToStore.updatedBy = req?.user?.id

    const clientStored: ClientType = await clientService.store(clientToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: clientStored
    })
  },
  delete: async (req: Request<DeleteClientParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const clientDeleted = await clientService.delete(id)

    if (clientDeleted === null || clientDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: clientDeleted
    })
  },
  update: async (req: Request<UpdateClientParamsType, {}, UpdateClientBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.name === null || req.body.name === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldClient = await clientService.getOne({ _id: id })

    if (oldClient === null || oldClient === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newClientData = { ...oldClient._doc, ...req.body }

    const clientsUpdated = await clientService.update(id, newClientData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: clientsUpdated
    })
  },
  changeIsActive: async (req: Request<ChangeIsActiveClientParamsType, {}, ChangeIsActiveClientBodyType, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    if (req.body.isActive === null || req.body.isActive === undefined) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const oldClient: ClientType = await clientService.getOne({ _id: id })

    if (oldClient === null || oldClient === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    if (oldClient.isActive === req.body.isActive) {
      const status = req.body.isActive ? '"Activo"' : '"Inactivo"'
      return res.status(404).json({
        status: 400,
        isUpdated: false,
        message: 'Ya se encuentra en el estado ' + status
      })
    }

    const clientsUpdated = await clientService.updateIsActive(id, req.body.isActive)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: clientsUpdated
    })
  }
}

export default clientsController
