import crypto from 'crypto'

import { env } from '../src/config/env'


const main = () => {
  const secretKey = env.DOKU.SECRET_KEY || 'SK-TEST'
  const clientId = env.DOKU.CLIENT_ID || 'MCH-TEST'
  const requestId = crypto.randomUUID()
  const timestamp = new Date().toISOString().slice(0, 19) + 'Z'
  const targetPath = '/api/webhooks/doku'

  const body = {
    service: { id: 'VIRTUAL_ACCOUNT' },
    acquirer: { id: 'BCA' },
    channel: { id: 'VIRTUAL_ACCOUNT_BCA' },
    transaction: {
      status: 'SUCCESS',
      date: new Date().toISOString(),
      original_request_id: crypto.randomUUID(),
    },
    order: {
      invoice_number: 'INV-TEST-123', // Replace with an actual invoice number from DB
      amount: 15000,
    },
    virtual_account_info: {
      virtual_account_number: '1234567890',
    },
  }

  const payload = JSON.stringify(body)
  const digest = crypto.createHash('sha256').update(payload).digest('base64')

  const component =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${timestamp}\n` +
    `Request-Target:${targetPath}\n` +
    `Digest:${digest}`

  const signature =
    'HMACSHA256=' + crypto.createHmac('sha256', secretKey).update(component).digest('base64')

  console.log('--- DOKU Webhook Test Data ---')
  console.log(`URL: http://localhost:${env.REST.PORT}${targetPath}`)
  console.log('Headers:')
  console.log(`Client-Id: ${clientId}`)
  console.log(`Request-Id: ${requestId}`)
  console.log(`Request-Timestamp: ${timestamp}`)
  console.log(`Signature: ${signature}`)
  console.log('Body:')
  console.log(payload)

  console.log('\n--- CURL Command ---')
  console.log(
    `curl -X POST http://localhost:${env.REST.PORT}${targetPath} \\
  -H "Client-Id: ${clientId}" \\
  -H "Request-Id: ${requestId}" \\
  -H "Request-Timestamp: ${timestamp}" \\
  -H "Signature: ${signature}" \\
  -H "Content-Type: application/json" \\
  -d '${payload}'`,
  )
}

main()
