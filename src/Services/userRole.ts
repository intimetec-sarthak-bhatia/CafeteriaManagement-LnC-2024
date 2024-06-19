import { UserRoleRepository } from "../Repository/userRole.repository";
import { UserRepository } from "../Repository/user.repository";
import { UserRole } from "../Entity/UserRole";

export class UserRoleService {
//   private userRepository = new UserRepository();
  private userRoleRepository = new UserRoleRepository();

  async getById(id: number): Promise<UserRole> {
    return await this.userRoleRepository.getRoleById(id);
  }

  async getAll(): Promise<UserRole[]> {
    return await this.userRoleRepository.getUserRoles();
  }
}
