import { ErrorCode } from '@/common/packages/types'

/**
 * Program-specific error codes.
 * Centralized in error-codes.ts for now, but can be moved here when splitting.
 */
export const ProgramErrorCode = {
  PRICE_NOT_FOUND: ErrorCode.PROGRAM_PRICE_NOT_FOUND,
} as const

export type ProgramErrorCode = (typeof ProgramErrorCode)[keyof typeof ProgramErrorCode]
