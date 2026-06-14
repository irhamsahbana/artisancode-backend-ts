import { Hono } from 'hono'

import logger from '@/config/logger'
import { IHealthUsecase } from '@/contracts/health.contract'
import { withSpan } from '@/telemetry'

export default function healthHandler(usecase: IHealthUsecase) {
  const router = new Hono()

  router.get('/', async (c) => {
    logger.info('[health.handler] request received')

    const result = await withSpan('health.handler', 'HealthHandler.check', async () => {
      logger.info('[health.handler] calling usecase')
      return usecase.check()
    })

    logger.info('[health.handler] sending response')

    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: result,
    })
  })

  return router
}
