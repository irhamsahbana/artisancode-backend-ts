import { IProgramUsecase } from '@/contracts/program.contract'

import { addPriceHandler } from './add-price'
import { addPricingHandler } from './add-pricing'
import { addScheduleHandler } from './add-schedule'
import { createProgramHandler } from './create'
import { deleteProgramHandler } from './delete'
import { deletePricingHandler } from './delete-pricing'
import { deleteScheduleHandler } from './delete-schedule'
import { findProgramByIdHandler } from './find-by-id'
import { findProgramListHandler } from './find-list'
import { updateProgramHandler } from './update'
import { updateAllProgramHandler } from './update-all'
import { updatePriceHandler } from './update-price'

export function createProgramHandlerDeps(usecase: IProgramUsecase) {
  return {
    create: createProgramHandler(usecase),
    update: updateProgramHandler(usecase),
    updateAll: updateAllProgramHandler(usecase),
    delete: deleteProgramHandler(usecase),
    findById: findProgramByIdHandler(usecase),
    findList: findProgramListHandler(usecase),
    addSchedule: addScheduleHandler(usecase),
    addPricing: addPricingHandler(usecase),
    addPrice: addPriceHandler(usecase),
    updatePrice: updatePriceHandler(usecase),
    deleteSchedule: deleteScheduleHandler(usecase),
    deletePricing: deletePricingHandler(usecase),
  }
}
