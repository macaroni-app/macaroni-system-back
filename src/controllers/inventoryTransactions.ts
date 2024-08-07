import { Request, Response } from 'express'
import { inventoryTransactionService } from '../services/inventoryTransactions'
import { IInventoryTransaction } from '../models/inventoryTransactions'
import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../labels/labels'
import { CreateInventoryTransactionBodyType, CreateManyInventoryTransactionsBodyType, DeleteInventoryTransactionParamsType, GetInventoryTransactionParamsType, GetInventoryTransactionQueryType, InventoryTransactionType, UpdateInventoryTransactionBodyType, UpdateInventoryTransactionParamsType } from '../schemas/inventoryTransactions'

const inventoryTransactionController = {
  getAll: async (req: Request<{}, {}, {}, GetInventoryTransactionQueryType>, res: Response): Promise<Response> => {
    const { id } = req.query

    let startDate = new Date()
    let endDate = new Date()

    if (req.query.startDate !== undefined) {
      startDate = new Date(req.query.startDate)
    }

    if (req.query.endDate !== undefined) {
      endDate = new Date(req.query.endDate)
      endDate.setDate(endDate.getDate() + 1)
    }

    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)

    if (req.query.startDate === undefined && req.query.endDate === undefined) {
      startDate = firstDayOfMonth
      endDate = lastDayOfMonth
    }

    const filters = {
      $expr: {
        $and: [
          { $gte: ['$createdAt', startDate] },
          { $lte: ['$createdAt', endDate] }
        ]
      }
    }

    const inventoryTransactions: IInventoryTransaction[] = await inventoryTransactionService.getAll(
      (id === undefined || id === null)
        ? filters
        : {
            $expr: {
              $and: [{ $eq: ['$_id', id] }]
            }
          }
    )

    return res.status(200).json({
      status: 200,
      total: inventoryTransactions.length,
      data: inventoryTransactions
    })
  },
  getOne: async (req: Request<GetInventoryTransactionParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const inventoryTransaction: IInventoryTransaction = await inventoryTransactionService.getOne({ _id: id })

    if (inventoryTransaction === null || inventoryTransaction === undefined) {
      return res.status(404).json({
        status: 404,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      data: inventoryTransaction
    })
  },
  store: async (req: Request<{}, {}, CreateInventoryTransactionBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.asset === null || req.body.asset === undefined) ||
      (req.body.transactionType === null || req.body.transactionType === undefined) ||
      (req.body.affectedAmount === null || req.body.affectedAmount === undefined) ||
      (req.body.oldQuantityAvailable === null || req.body.oldQuantityAvailable === undefined) ||
      (req.body.currentQuantityAvailable === null || req.body.currentQuantityAvailable === undefined) ||
      (req.body.unitCost === null || req.body.unitCost === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const inventoryTransactionToStore = { ...req.body }
    inventoryTransactionToStore.createdBy = req?.user?.id
    inventoryTransactionToStore.updatedBy = req?.user?.id

    const inventoryTransactionStored: InventoryTransactionType = await inventoryTransactionService.store(inventoryTransactionToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data: inventoryTransactionStored
    })
  },
  storeMany: async (req: Request<{}, {}, CreateManyInventoryTransactionsBodyType, {}>, res: Response): Promise<Response> => {
    if (req.body.inventoryTransactions !== undefined && req.body.inventoryTransactions.length === 0) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const inventoryTransactionToStore = req.body.inventoryTransactions.map(inventoryTransaction => {
      return { ...inventoryTransaction, createdBy: req.user?.id, updatedBy: req.user?.id }
    })

    const data = await inventoryTransactionService.storeMany(inventoryTransactionToStore)

    return res.status(201).json({
      status: 201,
      isStored: true,
      data
    })
  },
  delete: async (req: Request<DeleteInventoryTransactionParamsType, {}, {}, {}>, res: Response): Promise<Response> => {
    const { id } = req.params

    const inventoryTransactionDeleted = await inventoryTransactionService.delete(id)

    if (inventoryTransactionDeleted === null || inventoryTransactionDeleted === undefined) {
      return res.status(404).json({
        status: 404,
        isDeleted: false,
        message: NOT_FOUND
      })
    }

    return res.status(200).json({
      status: 200,
      isDeleted: true,
      data: inventoryTransactionDeleted
    })
  },
  update: async (req: Request<UpdateInventoryTransactionParamsType, {}, UpdateInventoryTransactionBodyType, {}>, res: Response): Promise<Response> => {
    if (
      (req.body.asset === null || req.body.asset === undefined) ||
      (req.body.transactionType === null || req.body.transactionType === undefined) ||
      (req.body.affectedAmount === null || req.body.affectedAmount === undefined) ||
      (req.body.oldQuantityAvailable === null || req.body.oldQuantityAvailable === undefined) ||
      (req.body.currentQuantityAvailable === null || req.body.currentQuantityAvailable === undefined) ||
      (req.body.unitCost === null || req.body.unitCost === undefined)
    ) {
      return res.status(400).json({
        status: 400,
        isStored: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }

    const { id } = req.params

    const oldInventoryTransaction = await inventoryTransactionService.getOne({ _id: id })

    if (oldInventoryTransaction === null || oldInventoryTransaction === undefined) {
      return res.status(404).json({
        status: 404,
        isUpdated: false,
        message: NOT_FOUND
      })
    }

    const newInventoryTransactionData = { ...oldInventoryTransaction._doc, ...req.body }

    const inventoryTransactionUpdated = await inventoryTransactionService.update(id, newInventoryTransactionData)

    if (inventoryTransactionUpdated.acknowledged === false) {
      return res.status(400).json({
        status: 400,
        isUpdated: false,
        message: MISSING_FIELDS_REQUIRED
      })
    }
    return res.status(200).json({
      status: 200,
      isUpdated: true,
      data: {
        _id: id,
        ...newInventoryTransactionData
      }
    })
  }
}

export default inventoryTransactionController
