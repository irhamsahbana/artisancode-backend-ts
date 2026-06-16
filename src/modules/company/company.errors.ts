import { ErrorCode } from '@/common/packages/types'

/**
 * Company-specific error codes.
 * Centralized in error-codes.ts for now, but can be moved here when splitting.
 */
export const CompanyErrorCode = {
  NOT_FOUND: ErrorCode.COMPANY_NOT_FOUND,
} as const

export type CompanyErrorCode = (typeof CompanyErrorCode)[keyof typeof CompanyErrorCode]
