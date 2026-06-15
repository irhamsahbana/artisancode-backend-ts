/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'bun:test'

import * as Entity from '@/entities/enrollment.entity'
import { Program, ProgramSchedule } from '@/entities/program.entity'

import { checkScheduleConflict } from '../enrollment.usecase/check-schedule-conflict'

function makeDeps() {
  return {
    repo: {} as any,
    branchRepo: {} as any,
    studentRepo: {} as any,
    programRepo: {} as any,
    invoiceUsecase: {} as any,
    transactor: {} as any,
    storage: {} as any,
    checkScheduleConflict: () => Promise.resolve(),
  }
}

function makeSchedule(overrides?: Partial<ProgramSchedule>): ProgramSchedule {
  return {
    id: 'sch-1',
    program_id: 'prog-1',
    day: 'monday',
    start_time: '09:00',
    end_time: '11:00',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }
}

function makeProgram(overrides?: Partial<Program>): Program {
  return {
    id: 'prog-1',
    company_id: 'comp-1',
    branch_id: null,
    name: 'Yoga Class',
    description: '',
    capacity: null,
    status: 'active',
    schedules: [makeSchedule()],
    pricings: [],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    ...overrides,
  }
}

function makeEnrollment(program: Program): Entity.Enrollment {
  return {
    id: 'enr-1',
    company_id: 'comp-1',
    branch_id: 'branch-1',
    student_id: 'student-1',
    program_id: program.id,
    pricing_id: 'pricing-1',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    program: program as Entity.Enrollment['program'],
  }
}

describe('checkScheduleConflict', () => {
  it('does nothing when new program has no schedules', async () => {
    const deps = makeDeps()
    const program = makeProgram({ schedules: [] })

    await checkScheduleConflict(deps, program, [])
  })

  it('does nothing when no existing enrollments', async () => {
    const deps = makeDeps()
    const program = makeProgram()

    await checkScheduleConflict(deps, program, [])
  })

  it('does nothing when schedules are on different days', async () => {
    const deps = makeDeps()
    const newProgram = makeProgram({ schedules: [makeSchedule({ day: 'monday' })] })
    const existingProgram = makeProgram({
      id: 'prog-2',
      schedules: [makeSchedule({ day: 'tuesday', program_id: 'prog-2' })],
    })
    const existing = [makeEnrollment(existingProgram)]

    await checkScheduleConflict(deps, newProgram, existing)
  })

  it('does nothing when schedules overlap on same day but different times', async () => {
    const deps = makeDeps()
    const newProgram = makeProgram({ schedules: [makeSchedule({ start_time: '09:00', end_time: '11:00' })] })
    const existingProgram = makeProgram({
      id: 'prog-2',
      schedules: [makeSchedule({ day: 'monday', start_time: '14:00', end_time: '16:00', program_id: 'prog-2' })],
    })
    const existing = [makeEnrollment(existingProgram)]

    await checkScheduleConflict(deps, newProgram, existing)
  })

  it('throws 409 when schedules overlap on same day and time', async () => {
    const deps = makeDeps()
    const newProgram = makeProgram({ schedules: [makeSchedule({ start_time: '09:00', end_time: '11:00' })] })
    const existingProgram = makeProgram({
      id: 'prog-2',
      name: 'Pilates Class',
      schedules: [makeSchedule({ day: 'monday', start_time: '10:00', end_time: '12:00', program_id: 'prog-2' })],
    })
    const existing = [makeEnrollment(existingProgram)]

    await expect(checkScheduleConflict(deps, newProgram, existing)).rejects.toThrow(
      'Schedule conflict with existing program: Pilates Class',
    )
  })

  it('throws when new schedule is entirely within existing schedule', async () => {
    const deps = makeDeps()
    const newProgram = makeProgram({ schedules: [makeSchedule({ start_time: '10:00', end_time: '11:00' })] })
    const existingProgram = makeProgram({
      id: 'prog-2',
      schedules: [makeSchedule({ day: 'monday', start_time: '09:00', end_time: '12:00', program_id: 'prog-2' })],
    })
    const existing = [makeEnrollment(existingProgram)]

    await expect(checkScheduleConflict(deps, newProgram, existing)).rejects.toThrow('Schedule conflict')
  })

  it('throws when existing schedule is entirely within new schedule', async () => {
    const deps = makeDeps()
    const newProgram = makeProgram({ schedules: [makeSchedule({ start_time: '09:00', end_time: '12:00' })] })
    const existingProgram = makeProgram({
      id: 'prog-2',
      schedules: [makeSchedule({ day: 'monday', start_time: '10:00', end_time: '11:00', program_id: 'prog-2' })],
    })
    const existing = [makeEnrollment(existingProgram)]

    await expect(checkScheduleConflict(deps, newProgram, existing)).rejects.toThrow('Schedule conflict')
  })

  it('skips existing enrollments without program schedules', async () => {
    const deps = makeDeps()
    const newProgram = makeProgram()
    const enrollmentWithoutProgram = {
      ...makeEnrollment(makeProgram()),
      program: undefined,
    } as any

    await checkScheduleConflict(deps, newProgram, [enrollmentWithoutProgram])
  })
})
