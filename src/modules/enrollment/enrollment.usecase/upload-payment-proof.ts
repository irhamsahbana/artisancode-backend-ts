import { AppError, ErrorCode } from '@/common/packages/types'

import { EnrollmentUsecaseDeps } from '../enrollment.usecase'

export interface UploadPaymentProofReq {
  id: string
  company_id: string
  file: Buffer
  filename: string
}

export async function uploadPaymentProof(
  deps: EnrollmentUsecaseDeps,
  req: UploadPaymentProofReq,
) {
  const enrollment = await deps.repo.findById(req.id, req.company_id)
  if (!enrollment) {
    throw new AppError(ErrorCode.NOT_FOUND, 'Enrollment not found')
  }

  const result = await deps.storage.upload({
    key: `payment-proofs/${req.company_id}/${req.id}/${req.filename}`,
    body: req.file,
    contentType: 'application/octet-stream',
  })

  const updated = await deps.repo.update({
    id: req.id,
    company_id: req.company_id,
    payment_proof_url: result.url,
  })

  return updated
}
