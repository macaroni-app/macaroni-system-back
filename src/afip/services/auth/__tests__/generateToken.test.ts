import axios from 'axios'
import fs from 'fs'
import { execSync } from 'child_process'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateToken } from '../generateToken'
import { processToken } from '../processToken'

vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))

vi.mock('fs', () => ({
  default: {
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
    unlinkSync: vi.fn()
  }
}))

vi.mock('child_process', () => ({
  execSync: vi.fn()
}))

vi.mock('../processToken', () => ({
  processToken: vi.fn()
}))

describe('generateToken', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('genera el login ticket, firma el XML, llama a WSAA y procesa el token', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from('signed-cms') as any)
    vi.mocked(axios.post).mockResolvedValue({ data: '<soap>response</soap>' })
    vi.mocked(processToken).mockResolvedValue({
      token: 'token',
      sign: 'sign',
      expTime: new Date('2026-04-15T12:10:00.000Z')
    })

    const result = await generateToken('wsfe')

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'LoginTicketRequest-1776254400.xml',
      expect.stringContaining('<service>wsfe</service>'),
      'utf8'
    )
    expect(execSync).toHaveBeenCalledWith(expect.stringContaining('openssl cms -sign -in LoginTicketRequest-1776254400.xml'))
    expect(fs.readFileSync).toHaveBeenCalledWith('LoginTicketRequest-1776254400.cms')
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining(Buffer.from('signed-cms').toString('base64')),
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          SOAPAction: expect.any(String)
        }
      }
    )
    expect(fs.unlinkSync).toHaveBeenCalledWith('LoginTicketRequest-1776254400.xml')
    expect(fs.unlinkSync).toHaveBeenCalledWith('LoginTicketRequest-1776254400.cms')
    expect(processToken).toHaveBeenCalledWith('<soap>response</soap>')
    expect(result).toEqual({
      token: 'token',
      sign: 'sign',
      expTime: new Date('2026-04-15T12:10:00.000Z')
    })
  })

  it('devuelve el error capturado si falla la llamada a WSAA', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-15T12:00:00.000Z'))
    const error = new Error('openssl error')
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from('signed-cms') as any)
    vi.mocked(axios.post).mockRejectedValue(error)

    const result = await generateToken('wsfe')

    expect(result).toBe(error)
    expect(axios.post).toHaveBeenCalledOnce()
    expect(processToken).not.toHaveBeenCalled()
  })
})
