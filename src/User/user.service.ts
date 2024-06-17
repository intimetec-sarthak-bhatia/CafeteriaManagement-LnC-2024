import { UserRoleRepository } from '../UserRole/userRole.repository';
import { User } from '../entity/User';
import { UserRepository } from './user.repository';

export class UserService {
  private userRepository = new UserRepository();
  private userRoleRepository = new UserRoleRepository();

  async getCommands(roleId: number): Promise<string[]> {
    const role = await this.userRoleRepository.getRoleById(roleId);
    switch (role.roleName) {
      case 'Admin':
        return [
          '1. Add User',
          '2. View Users',
          '4. Exit'
        ];
      case 'User':
        return [
          '1. View Menu',
          '2. Add Order',
          '4. View Menu',
          '5. Add Order',
          '6. View Orders',
          '7. Delete Order',
          '8. Update Order',
          '9. Exit'
        ];
        case 'Chef':
        return [
          '1. View Orders',
          '2. Update Order',
          '3. Exit'
        ];
      default:
        return ['1.Exit'];
    }

  }

  async createUserWithRole(name: string,email: string, password: string, roleId: number): Promise<number> {
    const user = {name, email, password, roleId};
    return await this.userRepository.createUser(user);
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.getUsers();
  }

  async getUserByEmail(email: string, password: string): Promise<User> {
    const user =  await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== password) {
      throw new Error('Incorrect password');
    }

    return user;
  }
}
