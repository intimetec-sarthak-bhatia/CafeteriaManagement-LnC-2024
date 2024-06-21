import { UserRoleRepository } from "../Repository/userRole";
import { UserRepository } from "../Repository/user";
import { UserRole } from "../Interface/UserRole";

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
