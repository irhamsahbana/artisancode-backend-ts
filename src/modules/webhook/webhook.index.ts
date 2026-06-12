import { Hono } from 'hono'

import { WebhookHandler } from './webhook.handler'

const WebhookRouter = new Hono()
const handler = new WebhookHandler()

WebhookRouter.post('/doku', handler.doku)

export default WebhookRouter
