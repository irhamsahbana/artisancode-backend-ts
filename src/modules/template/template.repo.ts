import { ItemplateRepo } from '@/contracts/template.contract'
import { templateReq, templateResp } from '@/entities/template.entity'


export default class TemplateRepo implements ItemplateRepo {
  async getSomething(req: templateReq): Promise<templateResp> {
    console.log(req)

    throw new Error('Method not implemented.')
  }
}
