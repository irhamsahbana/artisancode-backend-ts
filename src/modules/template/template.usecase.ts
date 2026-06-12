import { ItemplateRepo, ITemplateUsecase } from '@/contracts/template.contract'

import { templateReq, templateResp } from '../../entities/template.entity'

class TemplateUsecase implements ITemplateUsecase {
  private repo: ItemplateRepo

  constructor(repo: ItemplateRepo) {
    this.repo = repo
  }

  async getSomething(req: templateReq): Promise<templateResp> {
    const data = await this.repo.getSomething(req)

    return data
  }
}

export default TemplateUsecase
