import healthHandler from './health.handler'
import HealthRepo from './health.repo'
import HealthUsecase from './health.usecase'

const repo = new HealthRepo()
const usecase = new HealthUsecase(repo)
const handler = healthHandler(usecase)

export default handler
