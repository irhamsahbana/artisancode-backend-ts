export interface JwtPayload {
  id: string
  company_id: string
  branch_id?: string
  role_id: string
  name: string
  username: string
}

export interface AppEnv {
  Variables: {
    user?: JwtPayload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any
    rawBody?: string
    traceId?: string
  }
}
