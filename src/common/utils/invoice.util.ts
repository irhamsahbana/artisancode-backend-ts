export const generateInvoiceNumber = (): string => {
  const date = new Date()
  const year = date.getFullYear()
  const uniqueSuffix = Date.now().toString().slice(-6)
  return `INV/${year}/${uniqueSuffix}`
}
