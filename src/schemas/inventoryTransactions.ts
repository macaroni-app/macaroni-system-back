import { z } from 'zod'

export const CreateInventoryTransactionSchema = z.object({
  body: z.object({
    product: z.string({
      errorMap: (_issue, _ctx) => {
        return { message: 'product cannot be empty' }
      }
    })
      .trim()
      .min(24),
    transactionType: z.enum(['BUY', 'SELL'], {
      errorMap: (_issue, _ctx) => {
        return { message: 'transactionType must be BUY or SELL' }
      }
    }),
    affectedAmount: z.number({
      errorMap: (_issue, _ctx) => {
        return { message: 'affectedAmount must be greater than zero' }
      }
    }).nonnegative()
  })
})

export const UpdateInventoryTransactionSchema = z.object({
  body: z.object({
    product: z.string({
      errorMap: (_issue, _ctx) => {
        return { message: 'product cannot be empty' }
      }
    })
      .trim()
      .min(24),
    transactionType: z.enum(['BUY', 'SELL'], {
      errorMap: (_issue, _ctx) => {
        return { message: 'transactionType must be BUY or SELL' }
      }
    }),
    affectedAmount: z.number({
      errorMap: (_issue, _ctx) => {
        return { message: 'affectedAmount must be greater than zero' }
      }
    }).nonnegative()
  }),
  params: z.object({
    id: z.string({
      errorMap: (_issue, _ctx) => {
        return { message: 'id cannot be empty' }
      }
    }).min(24)
  })
})
