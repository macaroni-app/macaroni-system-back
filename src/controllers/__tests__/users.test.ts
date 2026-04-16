import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn()
  }
}))

vi.mock('bcrypt', () => ({
  default: {
    genSalt: vi.fn(),
    hash: vi.fn()
  }
}))

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { DUPLICATE_RECORD, INVALID_CREDENTIALS, INVALID_PASSWORD_LENGTH, MISSING_FIELDS_REQUIRED, NOT_FOUND } from '../../labels/labels'
import Role from '../../models/roles'
import { userService } from '../../services/users'
import usersController from '../users'

const buildResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
    sendStatus: vi.fn(),
    cookie: vi.fn(),
    clearCookie: vi.fn()
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  response.sendStatus.mockReturnValue(response)
  response.cookie.mockReturnValue(response)
  response.clearCookie.mockReturnValue(response)
  return response
}

const buildRequest = (overrides: Record<string, unknown> = {}): Record<string, any> => ({
  body: {},
  params: {},
  query: {},
  cookies: {},
  ...overrides
})

const buildUser = (overrides: Record<string, unknown> = {}): Record<string, any> => ({
  _id: 'user-id',
  id: 'user-id',
  _doc: {
    _id: 'user-id',
    firstName: 'Ana',
    lastName: 'Gomez',
    email: 'ana@test.com',
    refreshToken: []
  },
  firstName: 'Ana',
  lastName: 'Gomez',
  email: 'ana@test.com',
  role: {
    _id: 'role-id'
  },
  refreshToken: [],
  isActive: true,
  isValidPassword: vi.fn().mockResolvedValue(true),
  ...overrides
})

const mockJwt = () => {
  vi.mocked(jwt.sign).mockReset()
  vi.mocked(jwt.verify).mockReset()
}

describe('usersController auth', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    mockJwt()
  })

  it('returns not found when login user does not exist', async () => {
    const req = buildRequest({
      body: {
        email: 'missing@test.com',
        password: 'secret'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(null as never)

    await usersController.login(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: NOT_FOUND
    })
  })

  it('returns invalid credentials when login password is invalid', async () => {
    const req = buildRequest({
      body: {
        email: 'ana@test.com',
        password: 'wrong'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(buildUser({
      isValidPassword: vi.fn().mockResolvedValue(false)
    }) as never)

    await usersController.login(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: INVALID_CREDENTIALS
    })
  })

  it('logs in a valid user, stores refresh token and sets cookie', async () => {
    const req = buildRequest({
      body: {
        email: 'ana@test.com',
        password: 'secret'
      },
      cookies: {}
    })
    const res = buildResponse()
    const user = buildUser()
    vi.spyOn(userService, 'getOne').mockResolvedValue(user as never)
    vi.spyOn(userService, 'update').mockResolvedValue(1 as never)
    vi.spyOn(Role, 'findOne').mockResolvedValue({ code: 3000 } as never)
    vi.mocked(jwt.sign)
      .mockReturnValueOnce('access-token' as never)
      .mockReturnValueOnce('refresh-token' as never)
    vi.mocked(jwt.verify).mockReturnValue({ id: 'user-id', email: 'ana@test.com', iat: 2 } as never)

    await usersController.login(req as never, res as never)

    expect(userService.update).toHaveBeenCalledWith('user-id', expect.objectContaining({
      refreshToken: ['refresh-token']
    }))
    expect(res.cookie).toHaveBeenCalledWith('jwt', 'refresh-token', expect.objectContaining({
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }))
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'access-token',
      role: 3000
    })
  })

  it('clears an old login cookie and avoids duplicating the previous refresh token', async () => {
    const req = buildRequest({
      body: {
        email: 'ana@test.com',
        password: 'secret'
      },
      cookies: {
        jwt: 'old-token'
      }
    })
    const res = buildResponse()
    const user = buildUser({
      refreshToken: ['old-token', 'other-token']
    })
    vi.spyOn(userService, 'getOne').mockResolvedValue(user as never)
    vi.spyOn(userService, 'update').mockResolvedValue(1 as never)
    vi.spyOn(Role, 'findOne').mockResolvedValue({ code: 3000 } as never)
    vi.mocked(jwt.sign)
      .mockReturnValueOnce('access-token' as never)
      .mockReturnValueOnce('new-refresh-token' as never)
    vi.mocked(jwt.verify).mockImplementation(((token: string) => ({
      id: 'user-id',
      email: 'ana@test.com',
      iat: token === 'other-token' ? 2 : 1
    })) as never)

    await usersController.login(req as never, res as never)

    expect(res.clearCookie).toHaveBeenCalledWith('jwt', expect.objectContaining({ httpOnly: true }))
    expect(userService.update).toHaveBeenCalledWith('user-id', expect.objectContaining({
      refreshToken: ['other-token', 'new-refresh-token']
    }))
  })

  it('returns unauthorized when refresh token cookie is missing', async () => {
    const req = buildRequest()
    const res = buildResponse()

    await usersController.refreshToken(req as never, res as never)

    expect(res.sendStatus).toHaveBeenCalledWith(401)
  })

  it('returns forbidden when refresh token is invalid and no user owns it', async () => {
    const req = buildRequest({
      cookies: {
        jwt: 'invalid-token'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(null as never)
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('invalid token')
    })

    await usersController.refreshToken(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      status: 403,
      message: 'Forbidden'
    })
  })

  it('rotates a valid refresh token and stores the new token', async () => {
    const req = buildRequest({
      cookies: {
        jwt: 'refresh-token'
      }
    })
    const res = buildResponse()
    const user = buildUser({
      refreshToken: ['refresh-token']
    })
    vi.spyOn(userService, 'getOne').mockResolvedValue(user as never)
    vi.spyOn(userService, 'update').mockResolvedValue(1 as never)
    vi.spyOn(Role, 'findOne').mockResolvedValue({ code: 3000 } as never)
    vi.mocked(jwt.verify).mockReturnValue({
      firstName: 'Ana',
      lastName: 'Gomez',
      id: 'user-id',
      email: 'ana@test.com',
      iat: 1
    } as never)
    vi.mocked(jwt.sign)
      .mockReturnValueOnce('access-token' as never)
      .mockReturnValueOnce('new-refresh-token' as never)

    await usersController.refreshToken(req as never, res as never)

    expect(userService.update).toHaveBeenCalledWith('user-id', expect.objectContaining({
      refreshToken: ['new-refresh-token']
    }))
    expect(res.cookie).toHaveBeenCalledWith('jwt', 'new-refresh-token', expect.objectContaining({ httpOnly: true }))
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'access-token',
      role: 3000
    })
  })

  it('removes an expired refresh token from the user', async () => {
    const req = buildRequest({
      cookies: {
        jwt: 'expired-token'
      }
    })
    const res = buildResponse()
    const user = buildUser({
      refreshToken: ['expired-token', 'valid-token']
    })
    vi.spyOn(userService, 'getOne').mockResolvedValue(user as never)
    vi.spyOn(userService, 'update').mockResolvedValue(1 as never)
    vi.mocked(jwt.verify).mockImplementation(((token: string) => {
      if (token === 'expired-token') {
        throw new Error('expired token')
      }
      return { id: 'user-id', email: 'ana@test.com', iat: 2 }
    }) as never)

    await usersController.refreshToken(req as never, res as never)

    expect(userService.update).toHaveBeenCalledWith('user-id', expect.objectContaining({
      refreshToken: ['valid-token']
    }))
    expect(res.sendStatus).toHaveBeenCalledWith(403)
  })

  it('allows concurrent refresh within the grace window using the latest stored token', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 15, 12, 0, 10, 0))
    const req = buildRequest({
      cookies: {
        jwt: 'recent-token'
      }
    })
    const res = buildResponse()
    const tokenOwner = buildUser({
      refreshToken: ['latest-token']
    })
    vi.spyOn(userService, 'getOne')
      .mockResolvedValueOnce(null as never)
      .mockResolvedValueOnce(tokenOwner as never)
    vi.spyOn(Role, 'findOne').mockResolvedValue({ code: 3000 } as never)
    vi.mocked(jwt.verify).mockImplementation(((token: string) => ({
      firstName: 'Ana',
      lastName: 'Gomez',
      id: 'user-id',
      email: 'ana@test.com',
      iat: token === 'recent-token' ? Math.floor(Date.now() / 1000) - 5 : 2
    })) as never)
    vi.mocked(jwt.sign).mockReturnValue('access-token' as never)

    await usersController.refreshToken(req as never, res as never)

    expect(res.cookie).toHaveBeenCalledWith('jwt', 'latest-token', expect.objectContaining({ httpOnly: true }))
    expect(res.json).toHaveBeenCalledWith({
      accessToken: 'access-token',
      role: 3000
    })
  })

  it('returns no content when logout has no cookie', async () => {
    const req = buildRequest()
    const res = buildResponse()

    await usersController.logout(req as never, res as never)

    expect(res.sendStatus).toHaveBeenCalledWith(204)
  })

  it('clears cookie when logout token has no matching user', async () => {
    const req = buildRequest({
      cookies: {
        jwt: 'refresh-token'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(null as never)

    await usersController.logout(req as never, res as never)

    expect(res.clearCookie).toHaveBeenCalledWith('jwt', expect.objectContaining({ httpOnly: true }))
    expect(res.sendStatus).toHaveBeenCalledWith(204)
  })

  it('removes the current refresh token when logging out', async () => {
    const req = buildRequest({
      cookies: {
        jwt: 'refresh-token'
      }
    })
    const res = buildResponse()
    const user = buildUser({
      refreshToken: ['refresh-token', 'other-token']
    })
    vi.spyOn(userService, 'getOne').mockResolvedValue(user as never)
    vi.spyOn(userService, 'update').mockResolvedValue(1 as never)
    vi.mocked(jwt.verify).mockImplementation(((token: string) => ({
      id: 'user-id',
      email: 'ana@test.com',
      iat: token === 'other-token' ? 2 : 1
    })) as never)

    await usersController.logout(req as never, res as never)

    expect(userService.update).toHaveBeenCalledWith('user-id', expect.objectContaining({
      refreshToken: ['other-token']
    }))
    expect(res.clearCookie).toHaveBeenCalledWith('jwt', expect.objectContaining({ httpOnly: true }))
    expect(res.sendStatus).toHaveBeenCalledWith(204)
  })
})

describe('usersController user management', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    mockJwt()
  })

  it('rejects storing a user with missing required fields', async () => {
    const req = buildRequest({
      body: {
        firstName: 'Ana'
      }
    })
    const res = buildResponse()

    await usersController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: MISSING_FIELDS_REQUIRED
    })
  })

  it('rejects storing a user with a short password', async () => {
    const req = buildRequest({
      body: {
        firstName: 'Ana',
        lastName: 'Gomez',
        email: 'ana@test.com',
        password: '123'
      }
    })
    const res = buildResponse()

    await usersController.store(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: INVALID_PASSWORD_LENGTH
    })
  })

  it('rejects storing a duplicated email', async () => {
    const req = buildRequest({
      body: {
        firstName: 'Ana',
        lastName: 'Gomez',
        email: 'ana@test.com',
        password: '123456'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(buildUser() as never)

    await usersController.store(req as never, res as never)

    expect(res.sendStatus).toHaveBeenCalledWith(409)
  })

  it('stores a user with an explicit role', async () => {
    const req = buildRequest({
      body: {
        firstName: 'Ana',
        lastName: 'Gomez',
        email: 'ana@test.com',
        password: '123456',
        role: 'role-id'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(null as never)
    vi.spyOn(Role, 'findOne').mockResolvedValue({ _id: 'role-id' } as never)
    vi.spyOn(userService, 'store').mockResolvedValue({ id: 'user-id' } as never)

    await usersController.store(req as never, res as never)

    expect(Role.findOne).toHaveBeenCalledWith({ _id: 'role-id' })
    expect(userService.store).toHaveBeenCalledWith(expect.objectContaining({
      role: 'role-id'
    }))
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('stores a user with the default role when role is missing', async () => {
    const req = buildRequest({
      body: {
        firstName: 'Ana',
        lastName: 'Gomez',
        email: 'ana@test.com',
        password: '123456'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(null as never)
    vi.spyOn(Role, 'findOne').mockResolvedValue({ _id: 'default-role-id' } as never)
    vi.spyOn(userService, 'store').mockResolvedValue({ id: 'user-id' } as never)

    await usersController.store(req as never, res as never)

    expect(Role.findOne).toHaveBeenCalledWith({ code: 2001 })
    expect(userService.store).toHaveBeenCalledWith(expect.objectContaining({
      role: 'default-role-id'
    }))
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('rejects updating a user with missing required fields', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      },
      body: {
        firstName: 'Ana'
      }
    })
    const res = buildResponse()

    await usersController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rejects updating a user when the new email is duplicated', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      },
      body: {
        firstName: 'Ana',
        lastName: 'Gomez',
        email: 'new@test.com'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne')
      .mockResolvedValueOnce(buildUser({ email: 'old@test.com' }) as never)
      .mockResolvedValueOnce(buildUser({ email: 'new@test.com' }) as never)

    await usersController.update(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isStored: false,
      message: DUPLICATE_RECORD
    })
  })

  it('updates a user successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      },
      body: {
        firstName: 'Ana',
        lastName: 'Gomez',
        email: 'ana@test.com'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(buildUser() as never)
    vi.spyOn(userService, 'update').mockResolvedValue(1 as never)

    await usersController.update(req as never, res as never)

    expect(userService.update).toHaveBeenCalledWith('user-id', expect.objectContaining({
      firstName: 'Ana',
      updatedAt: expect.any(Date)
    }))
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      status: 201,
      isUpdated: true,
      data: 'user-id'
    })
  })

  it('rejects change password when password is missing', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      }
    })
    const res = buildResponse()

    await usersController.changePassword(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns not found when changing password for a missing user', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      },
      body: {
        password: '123456'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(null as never)

    await usersController.changePassword(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('hashes and updates password successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      },
      body: {
        password: '123456'
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(buildUser() as never)
    vi.spyOn(userService, 'update').mockResolvedValue(1 as never)
    vi.mocked(bcrypt.genSalt).mockResolvedValue('salt' as never)
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never)

    await usersController.changePassword(req as never, res as never)

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'salt')
    expect(userService.update).toHaveBeenCalledWith('user-id', expect.objectContaining({
      password: 'hashed-password',
      updatedAt: expect.any(Date)
    }))
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('rejects change is active when value is missing', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      },
      body: {}
    })
    const res = buildResponse()

    await usersController.changeIsActive(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns not found when changing active status for a missing user', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      },
      body: {
        isActive: false
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(null as never)

    await usersController.changeIsActive(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('rejects change is active when user already has the requested state', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      },
      body: {
        isActive: true
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(buildUser({ isActive: true }) as never)

    await usersController.changeIsActive(req as never, res as never)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      isUpdated: false,
      message: 'Ya se encuentra en el estado "Activo"'
    })
  })

  it('changes active status successfully', async () => {
    const req = buildRequest({
      params: {
        id: 'user-id'
      },
      body: {
        isActive: false
      }
    })
    const res = buildResponse()
    vi.spyOn(userService, 'getOne').mockResolvedValue(buildUser({ isActive: true }) as never)
    vi.spyOn(userService, 'updateIsActive').mockResolvedValue({ acknowledged: true } as never)

    await usersController.changeIsActive(req as never, res as never)

    expect(userService.updateIsActive).toHaveBeenCalledWith('user-id', false)
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
