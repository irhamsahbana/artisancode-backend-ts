import { ErrorCode } from '@/common/packages/types'

/**
 * Template-specific error codes.
 * Centralized in error-codes.ts for now, but can be moved here when splitting.
 */
export const TemplateErrorCode = {
  NOT_IMPLEMENTED: ErrorCode.NOT_IMPLEMENTED,
} as const

export type TemplateErrorCode = (typeof TemplateErrorCode)[keyof typeof TemplateErrorCode]
