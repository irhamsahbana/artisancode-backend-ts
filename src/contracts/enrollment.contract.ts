import * as Entity from '@/entities/enrollment.entity'
import { Invoice } from '@/entities/invoice.entity'

export interface IEnrollmentRepo {
  create(req: Entity.CreateEnrollmentReq): Promise<Entity.Enrollment>
  update(req: Entity.UpdateEnrollmentReq): Promise<Entity.Enrollment>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Enrollment | null>
  findByStudentAndProgram(
    studentId: string,
    programId: string,
    companyId: string,
  ): Promise<Entity.Enrollment | null>
  findActiveByStudentAndProgram(
    studentId: string,
    programId: string,
    companyId: string,
  ): Promise<Entity.Enrollment | null>
  findActiveByStudent(studentId: string, companyId: string): Promise<Entity.Enrollment[]>
  findList(req: Entity.GetEnrollmentReq): Promise<Entity.EnrollmentList>
  countActiveByProgram(programId: string, companyId: string): Promise<number>
  countActiveByPricing(pricingId: string, companyId: string): Promise<number>
}

export interface IEnrollmentUsecase {
  create(req: Entity.CreateEnrollmentReq): Promise<Entity.Enrollment>
  update(req: Entity.UpdateEnrollmentReq): Promise<Entity.Enrollment>
  generateInvoice(req: Entity.GenerateEnrollmentInvoiceReq): Promise<Invoice>
  delete(id: string, companyId: string): Promise<void>
  findById(id: string, companyId: string): Promise<Entity.Enrollment | null>
  findList(req: Entity.GetEnrollmentReq): Promise<Entity.EnrollmentList>
  uploadPaymentProof(req: {
    id: string
    company_id: string
    file: Buffer
    filename: string
  }): Promise<Entity.Enrollment>
}
