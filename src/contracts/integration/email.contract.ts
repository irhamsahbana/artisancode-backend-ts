export interface SendEmailReq {
  to: string
  subject: string
  html: string
}

export interface IEmailService {
  send(req: SendEmailReq): Promise<void>
}
