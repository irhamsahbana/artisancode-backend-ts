import { templateReq, templateResp } from '@/entities/template.entity'
export interface ITemplateUsecase {
  getSomething(req: templateReq): Promise<templateResp>
}

export interface ItemplateRepo {
  getSomething(req: templateReq): Promise<templateResp>
}
