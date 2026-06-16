import { AppError } from '@/common/packages/types'
import { ItemplateRepo } from '@/contracts/template.contract'
import { templateReq, templateResp } from '@/entities/template.entity'

import { TemplateErrorCode } from './template.errors'

export default class TemplateRepo implements ItemplateRepo {
  async getSomething(req: templateReq): Promise<templateResp> {
    console.log(req)

    throw new AppError(TemplateErrorCode.NOT_IMPLEMENTED, 'Method not implemented.', { httpCode: 501 })
  }
}
