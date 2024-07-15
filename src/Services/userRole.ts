import { UserRoleRepository } from "../Repository/userRole";
import { UserRole } from "../Interface/UserRole";

export class UserRoleService {
  private userRoleRepository = new UserRoleRepository();

  async getById(id: number): Promise<UserRole> {
    return await this.userRoleRepository.getRoleById(id);
  }

  async getAll(): Promise<UserRole[]> {
    return await this.userRoleRepository.getUserRoles();
  }
}
