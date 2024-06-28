import Product from '../models/products'
import SaleItem from '../models/saleItems'
import Sale from '../models/sales'

export const fillCostFieldSales = async (): Promise<any> => {
  const sales = await Sale.find({ costTotal: { $exists: false } })

  console.log(`${sales.length} records to update!`)

  for (const sale of sales) {
    const saleItems = await SaleItem.find({ sale: sale._id })

    let costTotal = 0

    for (const saleItem of saleItems) {
      const product = await Product.findById(saleItem.product)

      if (product !== null) {
        costTotal += Number(product.costPrice) * Number(saleItem.quantity)
      }
    }

    sale.costTotal = costTotal

    await sale.save()
  }

  console.log(`${sales.length} records updated!`)
}
