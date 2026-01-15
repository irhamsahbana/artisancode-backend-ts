import { AppError } from '@/common/app_error'
import { comparePassword, hashPassword } from '@/common/encryption'
import { generateToken } from '@/common/jwt'
import * as Entity from '@/entities/user.entity'

import { IUserRepo, IUserUsecase } from './user.contract'

export default class UserUsecase implements IUserUsecase {
  constructor(private repo: IUserRepo) {}

  async create(req: Entity.CreateUserReq): Promise<Entity.User> {
    const password = await hashPassword(req.password)
    return this.repo.create({ ...req, password })
  }

  async register(req: Entity.RegisterReq): Promise<Entity.RegisterRes> {
    const isExist = await this.repo.checkExistingUser(req.username, req.email)
    if (isExist) {
      throw new AppError(409, 'Username or email already exists')
    }

    const password = await hashPassword(req.password)
    return await this.repo.register({ ...req, password })
  }

  async login(req: Entity.LoginReq): Promise<Entity.LoginRes | null> {
    const user = await this.repo.findByUsernameForLogin(req.username)
    if (!user) return null

    const isValid = await comparePassword(req.password, user.password)
    if (!isValid) return null

    if (user.status !== 'active') {
      throw new AppError(403, 'User account is not active')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...cleanUser } = user
    const token = generateToken({
      id: user.id,
      company_id: user.companyId,
      role_id: user.roleId,
      name: user.name,
      username: user.username,
    })

    return {
      token,
      ...cleanUser,
    }
  }

  async findList(req: Entity.GetUserReq): Promise<Entity.UserList> {
    return this.repo.findList(req)
  }

  async findById(id: string, companyId?: string): Promise<Entity.User | null> {
    return this.repo.findById(id, companyId)
  }

  async findByUsername(username: string): Promise<Entity.User | null> {
    return this.repo.findByUsername(username)
  }
}
