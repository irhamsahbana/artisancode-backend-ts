import { Hono } from 'hono'

import activityLogRouter from '@/modules/activity_log/activity_log.index'
import branchRouter from '@/modules/branch/branch.index'
import categoryRouter from '@/modules/category/category.index'
import companyRouter from '@/modules/company/company.index'
import enrollmentRouter from '@/modules/enrollment/enrollment.index'
import healthRouter from '@/modules/health/health.index'
import invoiceRouter from '@/modules/invoice/invoice.index'
import programRouter from '@/modules/program/program.index'
import roleAndPermissionRouter from '@/modules/role_and_permission/role_and_permission.index'
import storageRouter from '@/modules/storage/storage.index'
import studentRouter from '@/modules/student/student.index'
import teacherRouter from '@/modules/teacher/teacher.index'
import templateRouter from '@/modules/template/template.index'
import userRouter from '@/modules/user/user.index'
import webhookRouter from '@/modules/webhook/webhook.index'

const router = new Hono()

router.route('/health', healthRouter)
router.route('/templates', templateRouter)
router.route('/activity-logs', activityLogRouter)
router.route('/companies', companyRouter)
router.route('/branches', branchRouter)
router.route('/categories', categoryRouter)
router.route('/programs', programRouter)
router.route('/students', studentRouter)
router.route('/teachers', teacherRouter)
router.route('/enrollments', enrollmentRouter)
router.route('/invoices', invoiceRouter)
router.route('/users', userRouter)
router.route('/role-and-permissions', roleAndPermissionRouter)
router.route('/storage', storageRouter)
router.route('/webhooks', webhookRouter)

export default router
