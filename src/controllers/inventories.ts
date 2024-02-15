import { Request, Response } from 'express'
import { inventoryService } from '../services/inventories'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateInventoryBodyType, DeleteInventoryParamsType, GetInventoryParamsType, GetInventoryQueryType, InventoryType, UpdateInventoryBodyType, UpdateInventoryParamsType } from '../schemas/inventories'

const inventoriesController = {
  getAll: async (req: Request<{}, {}, {}, GetInventoryQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    const filters = {
      $expr: {
        $and: [{ $eq: ['$_id', id] }]
      }
    }

    const inventories: InventoryType[] = await inventoryService.getAll((id !== null && id !== undefined) ? filters : {})

    return res.status(200).json({
      status: 200,
      total: inventories.length,
      data: inventories
    })
  },
  getOne: async (req: Request<GetInventoryParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const inventory: InventoryType = await inventoryService.getOne({ _id: id })

    if (inventory === null || inventory === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: inventory
    })
  },
  store: async (req: Request<{}, {}, CreateInventoryBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.product === null || req.body.product === undefined) ||
      (req.body.quantityAvailable === null || req.body.quantityAvailable === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const inventoryToStore = { ...req.body }
    inventoryToStore.createdBy = req?.user?.id
    inventoryToStore.updatedBy = req?.user?.id

    const inventoryStored: InventoryType = await inventoryService.store(inventoryToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: inventoryStored
    })
  },
  delete: async (req: Request<DeleteInventoryParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const inventoryDeleted = await inventoryService.delete(id)

    if (inventoryDeleted === null || inventoryDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: inventoryDeleted
    })
  },
  update: async (req: Request<UpdateInventoryParamsType, {}, UpdateInventoryBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.product === null || req.body.product === undefined) ||
      (req.body.quantityAvailable === null || req.body.quantityAvailable === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldInventory = await inventoryService.getOne({ _id: id })

    if (oldInventory === null || oldInventory === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newInventoryData = { ...oldInventory._doc, ...req.body }

    const inventoryUpdated = await inventoryService.update(id, newInventoryData)

    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: inventoryUpdated
    })
  }
}

export default inventoriesController
