import {
  CheckStatusRes,
  GeneratePaymentLinkReq,
  GeneratePaymentLinkRes,
  IPaymentGateway,
} from '@/contracts/integration'

import { checkStatus } from './check-status'
import { createDokuClientConfig, type DokuClientConfig } from './client'
import { generatePaymentLink } from './generate-payment'
import { verifyNotificationSignature } from './verify-webhook'

export class DokuIntegration implements IPaymentGateway {
  private config: DokuClientConfig

  constructor() {
    this.config = createDokuClientConfig()
  }

  generatePaymentLink(req: GeneratePaymentLinkReq): Promise<GeneratePaymentLinkRes> {
    return generatePaymentLink(this.config, req)
  }

  checkStatus(invoiceNumber: string): Promise<CheckStatusRes> {
    return checkStatus(this.config, invoiceNumber)
  }

  verifyNotificationSignature(
    headers: Record<string, string | string[] | undefined>,
    body: string,
    targetPath: string,
  ): boolean {
    return verifyNotificationSignature(this.config, headers, body, targetPath)
  }
}
