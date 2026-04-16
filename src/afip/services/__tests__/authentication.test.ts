import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../auth/generateToken', () => ({
  generateToken: vi.fn()
}))

import { afipAuthService } from '../../../services/afipAuth'
import { generateToken } from '../auth/generateToken'
import { AuthenticationService } from '../authentication'

describe('AuthenticationService', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.mocked(generateToken).mockReset()
  })

  it('generates and stores a token when there is no existing token', async () => {
    const expirationTime = new Date('2026-04-15T13:00:00.000Z')
    vi.spyOn(afipAuthService, 'getOne').mockResolvedValue(null as never)
    vi.mocked(generateToken).mockResolvedValue({
      token: 'new-token',
      sign: 'new-sign',
      expTime: expirationTime
    } as never)
    vi.spyOn(afipAuthService, 'store').mockResolvedValue({
      token: 'new-token',
      sign: 'new-sign',
      expirationTime
    } as never)

    const result = await new AuthenticationService('wsfe').getAuth()

    expect(generateToken).toHaveBeenCalledWith('wsfe')
    expect(afipAuthService.store).toHaveBeenCalledWith({
      serviceName: 'wsfe',
      token: 'new-token',
      sign: 'new-sign',
      expirationTime
    })
    expect(result).toEqual({
      token: 'new-token',
      sign: 'new-sign',
      expirationTime
    })
  })

  it('refreshes an existing token when it expires within the safety margin', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
    const expirationTime = new Date('2026-04-15T12:04:00.000Z')
    vi.spyOn(afipAuthService, 'getOne').mockResolvedValue({
      _doc: {
        serviceName: 'wsfe',
        token: 'old-token',
        sign: 'old-sign'
      },
      serviceName: 'wsfe',
      token: 'old-token',
      sign: 'old-sign',
      expirationTime
    } as never)
    vi.mocked(generateToken).mockResolvedValue({
      token: 'new-token',
      sign: 'new-sign',
      expTime: new Date('2026-04-15T13:00:00.000Z')
    } as never)
    vi.spyOn(afipAuthService, 'update').mockResolvedValue({ acknowledged: true } as never)

    const result = await new AuthenticationService('wsfe').getAuth()

    expect(afipAuthService.update).toHaveBeenCalledWith('wsfe', expect.objectContaining({
      token: 'new-token',
      sign: 'new-sign',
      expirationTime: new Date('2026-04-15T13:00:00.000Z')
    }))
    expect(result).toEqual({
      token: 'new-token',
      sign: 'new-sign',
      expirationTime: new Date('2026-04-15T13:00:00.000Z')
    })
  })

  it('returns the existing token when it is still valid', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
    vi.spyOn(afipAuthService, 'getOne').mockResolvedValue({
      token: 'valid-token',
      sign: 'valid-sign',
      expirationTime: new Date('2026-04-15T13:00:00.000Z')
    } as never)
    const update = vi.spyOn(afipAuthService, 'update')

    const result = await new AuthenticationService('wsfe').getAuth()

    expect(generateToken).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
    expect(result).toEqual({
      token: 'valid-token',
      sign: 'valid-sign',
      expirationTime: new Date('2026-04-15T13:00:00.000Z')
    })
  })
})
