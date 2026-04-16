import { afterEach, describe, expect, it, vi } from 'vitest'

import { MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import { roleService } from '../../services/roles'
import rolesController from '../roles'

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
  ...overrides
})

describe('rolesController', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('gets all roles with an empty filter', async () => {
    const req = buildRequest()
    const res = buildResponse()
    vi.spyOn(roleService, 'getAll').mockResolvedValue([{ id: 'role-id' }] as never)

    await rolesController.getAll(req as never, res as never)

    expect(roleService.getAll).toHaveBeenCalledWith({})
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('gets roles by id when id is provided', async () => {
    const req = buildRequest({
      query: {
        id: 'role-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(roleService, 'getAll').mockResolvedValue([] as never)

    await rolesController.getAll(req as never, res as never)

    expect(roleService.getAll).toHaveBeenCalledWith({
      $expr: {
        $and: [{ $eq: ['$_id', 'role-id'] }]
      }
    })
  })

  it('returns not found when one role does not exist', async () => {
    const req = buildRequest({
      params: {
        id: 'role-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(roleService, 'getOne').mockResolvedValue(null as never)

    await rolesController.getOne(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: NOT_FOUND
    })
  })

  it('returns one role when it exists', async () => {
    const req = buildRequest({
      params: {
        id: 'role-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(roleService, 'getOne').mockResolvedValue({ id: 'role-id' } as never)

    await rolesController.getOne(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects storing a role with missing fields', async () => {
    const req = buildRequest({
      body: {
        name: 'Admin'
      }
    })
    const res = buildResponse()

    await rolesController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('stores a role successfully', async () => {
    const req = buildRequest({
      body: {
        name: 'Admin',
        code: 3000
      }
    })
    const res = buildResponse()
    vi.spyOn(roleService, 'store').mockResolvedValue({ id: 'role-id' } as never)

    await rolesController.store(req as never, res as never)

    expect(roleService.store).toHaveBeenCalledWith({
      name: 'Admin',
      code: 3000
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('returns not found when delete does not find a role', async () => {
    const req = buildRequest({
      params: {
        id: 'role-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(roleService, 'delete').mockResolvedValue(null as never)

    await rolesController.delete(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('deletes a role successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'role-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(roleService, 'delete').mockResolvedValue({ deletedCount: 1 } as never)

    await rolesController.delete(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('rejects updating a role with missing fields', async () => {
    const req = buildRequest({
      params: {
        id: 'role-id'
      },
      body: {
        name: 'Admin'
      }
    })
    const res = buildResponse()

    await rolesController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns not found when updating a missing role', async () => {
    const req = buildRequest({
      params: {
        id: 'role-id'
      },
      body: {
        name: 'Admin',
        code: 3000
      }
    })
    const res = buildResponse()
    vi.spyOn(roleService, 'getOne').mockResolvedValue(null as never)

    await rolesController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('updates a role by merging old document with request body', async () => {
    const req = buildRequest({
      params: {
        id: 'role-id'
      },
      body: {
        name: 'Admin',
        code: 3000
      }
    })
    const res = buildResponse()
    vi.spyOn(roleService, 'getOne').mockResolvedValue({
      _doc: {
        id: 'role-id',
        untouched: true
      }
    } as never)
    vi.spyOn(roleService, 'update').mockResolvedValue({ acknowledged: true } as never)

    await rolesController.update(req as never, res as never)

    expect(roleService.update).toHaveBeenCalledWith('role-id', {
      id: 'role-id',
      untouched: true,
      name: 'Admin',
      code: 3000
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
