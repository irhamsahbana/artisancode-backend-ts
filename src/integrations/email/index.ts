import logger from '@/config/logger'
import { IEmailService, SendEmailReq } from '@/contracts/integration'

export class MockEmailService implements IEmailService {
  async send(req: SendEmailReq): Promise<void> {
    // Mock implementation — logs instead of sending
    logger.info('[Email Mock] Would send email', {
      to: req.to,
      subject: req.subject,
      htmlLength: req.html.length,
    })
  }
}
