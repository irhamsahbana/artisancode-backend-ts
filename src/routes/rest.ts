import { Router } from 'express'

import branchRouter from '@/modules/branch/branch.index'
import categoryRouter from '@/modules/category/category.index'
import companyRouter from '@/modules/company/company.index'
import enrollmentRouter from '@/modules/enrollment/enrollment.index'
import programRouter from '@/modules/program/program.index'
import roleAndPermissionRouter from '@/modules/role_and_permission/role_and_permission.index'
import studentRouter from '@/modules/student/student.index'
import teacherRouter from '@/modules/teacher/teacher.index'
import templateRouter from '@/modules/template/template.index'
import userRouter from '@/modules/user/user.index'

const router = Router()

router.use('/templates', templateRouter)
router.use('/companies', companyRouter)
router.use('/branches', branchRouter)
router.use('/categories', categoryRouter)
router.use('/programs', programRouter)
router.use('/students', studentRouter)
router.use('/teachers', teacherRouter)
router.use('/enrollments', enrollmentRouter)
router.use('/users', userRouter)
router.use('/role-and-permissions', roleAndPermissionRouter)

export default router
