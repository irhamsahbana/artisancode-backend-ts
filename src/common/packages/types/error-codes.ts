// ── General (2000–2099) ────────────────────────────────
export const ErrorCode = {
  VALIDATION_ERROR: 2000,
  NOT_FOUND: 2001,
  UNAUTHORIZED: 2002,
  FORBIDDEN: 2003,
  CONFLICT: 2004,
  TOO_MANY_REQUESTS: 2005,
  REQUEST_TIMEOUT: 2006,
  INTERNAL_ERROR: 2007,
  SERVICE_UNAVAILABLE: 2008,

  // ── HTTP Client (2100–2199) ─────────────────────────────
  HTTP_BAD_REQUEST: 2100,
  HTTP_UNAUTHORIZED: 2101,
  HTTP_FORBIDDEN: 2102,
  HTTP_NOT_FOUND: 2103,
  HTTP_TIMEOUT: 2104,
  HTTP_INTERNAL_ERROR: 2105,
  NETWORK_ERROR: 2106,

  // ── Auth (2200–2299) ────────────────────────────────────
  AUTH_INVALID_CREDENTIALS: 2200,
  AUTH_TOKEN_EXPIRED: 2201,
  AUTH_TOKEN_INVALID: 2202,

  // ── Database (2300–2399) ────────────────────────────────
  DB_RECORD_NOT_FOUND: 2300,
  DB_DUPLICATE_ENTRY: 2301,
  DB_TRANSACTION_FAILED: 2302,

  // ── External Service (2400–2499) ────────────────────────
  EXTERNAL_SERVICE_ERROR: 2400,
  PAYMENT_GATEWAY_ERROR: 2401,
  STORAGE_ERROR: 2402,

  // ── Resilience (2500–2599) ─────────────────────────────
  CIRCUIT_BREAKER_OPEN: 2500,
  RESILIENCE_EXHAUSTED: 2501,
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]
