export interface IInvoiceData {
  totalAmount: number
  pointOfSale: number
  invoiceType: number
  concept: number
  documentNumber: number
  documentType: string
  sale: string
  condicionIVAReceptorId: string
}

export const validateInvoiceData = (data: Partial<IInvoiceData>): string[] => {
  const missingFields: string[] = []

  if (data.totalAmount == null) missingFields.push('totalAmount')
  if (data.pointOfSale == null) missingFields.push('pointOfSale')
  if (data.invoiceType == null) missingFields.push('invoiceType')
  if (data.concept == null) missingFields.push('concept')
  if (data.documentNumber == null) missingFields.push('documentNumber')
  if (data.documentType == null) missingFields.push('documentType')
  if (data.sale == null) missingFields.push('sale')
  if (data.condicionIVAReceptorId == null) missingFields.push('condicionIVAReceptorId')

  return missingFields
}
