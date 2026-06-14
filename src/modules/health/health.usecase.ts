import logger from '@/config/logger'
import { IHealthRepo, IHealthUsecase } from '@/contracts/health.contract'
import { withSpan } from '@/telemetry'

export default class HealthUsecase implements IHealthUsecase {
  constructor(private readonly repo: IHealthRepo) {}

  async check() {
    logger.info('[health.usecase] starting health check')

    const db = await withSpan('health.usecase', 'HealthUsecase.checkDb', async () => {
      logger.info('[health.usecase] delegating to repo for db check')
      return this.repo.checkDb()
    })

    const cache = await withSpan('health.usecase', 'HealthUsecase.checkCache', async () => {
      logger.info('[health.usecase] delegating to repo for cache check')
      return this.repo.checkCache()
    })

    logger.info('[health.usecase] all checks completed')
    return { db, cache }
  }
}
