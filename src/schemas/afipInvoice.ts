import { z } from 'zod'

export const AfipInvoiceSchema = z.object({
  cuit: z.string().optional(),
  totalAmount: z.number().optional(),
  pointOfSale: z.number().optional(),
  invoiceType: z.number().optional(),
  concept: z.number().optional(),
  documentType: z.string().optional(),
  documentNumber: z.number().optional(),
  invoiceNumber: z.number().optional(),
  cbteFch: z.string().optional(),
  cae: z.string().optional(),
  expirationDate: z.string().optional(),
  sale: z.string().optional(),
  condicionIVAReceptorId: z.string().optional()
})

export const CreateAfipInvoiceSchema = z.object({
  body: AfipInvoiceSchema
})

export const GetAfipInvoiceSchema = z.object({
  params: z.object({
    saleId: z.string().optional()
  }),
  query: z.object({
    saleId: z.string().optional()
  })
})

export type AfipInvoiceType = z.infer<typeof AfipInvoiceSchema>
export type CreateAfipInvoiceBodyType = z.infer<typeof CreateAfipInvoiceSchema>['body']
export type GetAfipInvoiceParamsType = z.infer<typeof GetAfipInvoiceSchema>['params']
export type GetAfipInvoiceQueryType = z.infer<typeof GetAfipInvoiceSchema>['query']
