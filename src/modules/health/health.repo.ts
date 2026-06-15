import logger from '@/config/logger'
import { IHealthRepo } from '@/contracts/health.contract'
import { withSpan } from '@/telemetry'

export default class HealthRepo implements IHealthRepo {
  async checkDb() {
    return withSpan('HealthRepo.checkDb', async () => {
      logger.info('[health.repo] checking database connectivity')
      // simulasikan query ke database
      await new Promise((r) => setTimeout(r, 5))
      logger.info('[health.repo] database respond')
      return { status: 'ok', latency: 5 }
    })
  }

  async checkCache() {
    return withSpan('HealthRepo.checkCache', async () => {
      logger.info('[health.repo] checking cache connectivity')
      // simulasikan query ke cache
      await new Promise((r) => setTimeout(r, 2))
      logger.info('[health.repo] cache respond')
      return { status: 'ok', latency: 2 }
    })
  }
}
