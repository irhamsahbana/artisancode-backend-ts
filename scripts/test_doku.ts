import { env } from '../src/config/env'
import logger from '../src/config/logger'
import { createPaymentGateway } from '../src/integrations'

const main = async () => {
  // Dynamic import for ESM module compatibility
  const { faker } = await import('@faker-js/faker')

  console.log('--- Testing DokuIntegration ---')
  console.log('Environment:', env.APP_ENV)
  console.log('Is Production:', env.IS_PRODUCTION)
  console.log('Client ID:', env.DOKU.CLIENT_ID ? 'Set' : 'Not Set')

  // Initialize logger to avoid unused import error if needed, or just use it
  logger.info('Starting Doku Test Script')

  const paymentGateway = createPaymentGateway()

  const invoiceNumber = `INV-TEST-${Date.now()}`
  const amount = faker.number.int({ min: 10000, max: 1000000 })
  const req = {
    invoice_number: invoiceNumber,
    amount: amount,
    customer_email: faker.internet.email(),
    customer_name: faker.person.fullName(),
    customer_phone: '08' + faker.string.numeric(10),
    customer_address: faker.location.streetAddress(),
    customer_country: 'ID',
    line_items: [
      {
        name: faker.commerce.productName(),
        price: amount,
        quantity: 1,
      },
    ],
  }

  console.log('Generating payment link for:', req)

  try {
    const res = await paymentGateway.generatePaymentLink(req)
    console.log('--- Success ---')
    console.log('Invoice ID:', res.invoice_id)
    console.log('Payment URL:', res.payment_url)
  } catch (error) {
    console.error('--- Error ---')
    console.error(error)
  }
}

main()
