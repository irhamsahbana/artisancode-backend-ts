import { ErrorCode } from '@/common/packages/types'

/**
 * Role and Permission-specific error codes.
 * Centralized in error-codes.ts for now, but can be moved here when splitting.
 */
export const RoleErrorCode = {
  COMPANY_REQUIRED: ErrorCode.ROLE_COMPANY_REQUIRED,
} as const

export type RoleErrorCode = (typeof RoleErrorCode)[keyof typeof RoleErrorCode]
