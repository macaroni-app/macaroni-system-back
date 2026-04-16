import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import assetsController from '../assets'
import businessController from '../business'
import categoryController from '../categories'
import clientsController from '../clients'
import methodPaymentController from '../paymentMethods'
import productsController from '../products'
import productTypeController from '../productTypes'
import { assetService } from '../../services/assets'
import { businessService } from '../../services/business'
import { categoryService } from '../../services/categories'
import { clientService } from '../../services/clients'
import { methodPaymentService } from '../../services/paymentMethods'
import { productsService } from '../../services/products'
import { productTypeService } from '../../services/productTypes'

const buildResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  return response
}

const buildRequest = (overrides: Record<string, unknown> = {}): Record<string, any> => ({
  body: {},
  params: {},
  query: {},
  user: {
    id: 'user-id'
  },
  ...overrides
})

const idFilter = (id: string) => ({
  $expr: {
    $and: [{ $eq: ['$_id', id] }]
  }
})

const activeFilter = {
  $expr: {
    $and: [{ $eq: ['$isActive', true] }]
  }
}

const catalogConfigs = [
  {
    name: 'clientsController',
    controller: clientsController,
    service: clientService,
    validBody: { name: 'Cliente' },
    expectedDefaultFilter: {}
  },
  {
    name: 'productsController',
    controller: productsController,
    service: productsService,
    validBody: { name: 'Producto', costPrice: 100 },
    expectedDefaultFilter: activeFilter
  },
  {
    name: 'assetsController',
    controller: assetsController,
    service: assetService,
    validBody: { name: 'Insumo', category: 'category-id', costPrice: 100 },
    expectedDefaultFilter: activeFilter
  },
  {
    name: 'categoryController',
    controller: categoryController,
    service: categoryService,
    validBody: { name: 'Categoria' },
    expectedDefaultFilter: {}
  },
  {
    name: 'businessController',
    controller: businessController,
    service: businessService,
    validBody: { name: 'Negocio' },
    expectedDefaultFilter: {}
  },
  {
    name: 'methodPaymentController',
    controller: methodPaymentController,
    service: methodPaymentService,
    validBody: { name: 'Efectivo' },
    expectedDefaultFilter: {}
  },
  {
    name: 'productTypeController',
    controller: productTypeController,
    service: productTypeService,
    validBody: { name: 'Tipo' },
    expectedDefaultFilter: {}
  }
]

describe.each(catalogConfigs)('$name', ({ controller, service, validBody, expectedDefaultFilter }) => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('gets all records using the expected default filter', async () => {
    const req = buildRequest()
    const res = buildResponse()
    vi.spyOn(service, 'getAll').mockResolvedValue([{ id: 'record-id' }] as never)

    await controller.getAll(req as never, res as never)

    expect(service.getAll).toHaveBeenCalledWith(expectedDefaultFilter)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      total: 1,
      data: [{ id: 'record-id' }]
    })
  })

  it('gets records by id when id is provided', async () => {
    const req = buildRequest({
      query: {
        id: 'record-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(service, 'getAll').mockResolvedValue([] as never)

    await controller.getAll(req as never, res as never)

    expect(service.getAll).toHaveBeenCalledWith(idFilter('record-id'))
  })

  it('returns not found when one record does not exist', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(service, 'getOne').mockResolvedValue(null as never)

    await controller.getOne(req as never, res as never)

    expect(service.getOne).toHaveBeenCalledWith({ _id: 'record-id' })
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: NOT_FOUND
    })
  })

  it('returns one record when it exists', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(service, 'getOne').mockResolvedValue({ id: 'record-id' } as never)

    await controller.getOne(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 200,
      data: { id: 'record-id' }
    })
  })

  it('rejects store when required fields are missing', async () => {
    const req = buildRequest({
      body: {}
    })
    const res = buildResponse()

    await controller.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('stores a record with audit fields', async () => {
    const req = buildRequest({
      body: validBody
    })
    const res = buildResponse()
    vi.spyOn(service, 'store').mockResolvedValue({ id: 'record-id' } as never)

    await controller.store(req as never, res as never)

    expect(service.store).toHaveBeenCalledWith({
      ...validBody,
      createdBy: 'user-id',
      updatedBy: 'user-id'
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('returns not found when delete does not find a record', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(service, 'delete').mockResolvedValue(null as never)

    await controller.delete(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isDeleted: false,
      message: NOT_FOUND
    })
  })

  it('deletes a record successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(service, 'delete').mockResolvedValue({ deletedCount: 1 } as never)

    await controller.delete(req as never, res as never)

    expect(service.delete).toHaveBeenCalledWith('record-id')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects update when required fields are missing', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      },
      body: {}
    })
    const res = buildResponse()

    await controller.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns not found when updating a missing record', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      },
      body: validBody
    })
    const res = buildResponse()
    vi.spyOn(service, 'getOne').mockResolvedValue(null as never)

    await controller.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })

  it('updates a record by merging old document with request body', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      },
      body: validBody
    })
    const res = buildResponse()
    vi.spyOn(service, 'getOne').mockResolvedValue({
      _doc: {
        id: 'record-id',
        untouched: 'value'
      }
    } as never)
    vi.spyOn(service, 'update').mockResolvedValue({ acknowledged: true } as never)

    await controller.update(req as never, res as never)

    expect(service.update).toHaveBeenCalledWith('record-id', {
      id: 'record-id',
      untouched: 'value',
      ...validBody
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects change active when isActive is missing', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      },
      body: {}
    })
    const res = buildResponse()

    await controller.changeIsActive(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns not found when changing active state for a missing record', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      },
      body: {
        isActive: false
      }
    })
    const res = buildResponse()
    vi.spyOn(service, 'getOne').mockResolvedValue(null as never)

    await controller.changeIsActive(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      isUpdated: false,
      message: NOT_FOUND
    })
  })

  it('rejects change active when record already has the requested state', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      },
      body: {
        isActive: true
      }
    })
    const res = buildResponse()
    vi.spyOn(service, 'getOne').mockResolvedValue({ isActive: true } as never)
    const updateIsActive = vi.spyOn(service, 'updateIsActive')

    await controller.changeIsActive(req as never, res as never)

    expect(updateIsActive).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isUpdated: false,
      message: 'Ya se encuentra en el estado "Activo"'
    })
  })

  it('changes active state successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'record-id'
      },
      body: {
        isActive: false
      }
    })
    const res = buildResponse()
    vi.spyOn(service, 'getOne').mockResolvedValue({ isActive: true } as never)
    vi.spyOn(service, 'updateIsActive').mockResolvedValue({ acknowledged: true } as never)

    await controller.changeIsActive(req as never, res as never)

    expect(service.updateIsActive).toHaveBeenCalledWith('record-id', false)
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
