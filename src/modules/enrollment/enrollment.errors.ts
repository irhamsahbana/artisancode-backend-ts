import { ErrorCode } from '@/common/packages/types'

/**
 * Enrollment-specific error codes.
 * Centralized in error-codes.ts for now, but can be moved here when splitting.
 */
export const EnrollmentErrorCode = {
  NOT_FOUND: ErrorCode.ENROLLMENT_NOT_FOUND,
} as const

export type EnrollmentErrorCode = (typeof EnrollmentErrorCode)[keyof typeof EnrollmentErrorCode]
