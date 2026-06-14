export interface HealthCheckResult {
  status: string
  latency: number
}

export interface IHealthRepo {
  checkDb(): Promise<HealthCheckResult>
  checkCache(): Promise<HealthCheckResult>
}

export interface IHealthUsecase {
  check(): Promise<{
    db: HealthCheckResult
    cache: HealthCheckResult
  }>
}
