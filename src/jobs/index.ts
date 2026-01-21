import { startInvoiceGeneratorJob } from './invoice_generator'
import { startPaymentReminderJob } from './payment_reminder'

export const startJobs = () => {
  startInvoiceGeneratorJob()
  startPaymentReminderJob()
}
