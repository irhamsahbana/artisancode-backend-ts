import { Router } from 'express'

import { WebhookHandler } from './webhook.handler'

const WebhookRouter = Router()
const handler = new WebhookHandler()

WebhookRouter.post('/doku', handler.doku)

export default WebhookRouter
