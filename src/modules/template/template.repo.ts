import { templateReq, templateResp } from '@/entities/template.entity'

import { ItemplateRepo } from './template.contract'

export default class TemplateRepo implements ItemplateRepo {
  async getSomething(req: templateReq): Promise<templateResp> {
    console.log(req)

    throw new Error('Method not implemented.')
  }
}
