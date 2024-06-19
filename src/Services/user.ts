import { UserRoleRepository } from '../Repository/userRole.repository';
import { User } from '../Entity/User';
import { UserRepository } from '../Repository/user.repository';

export class UserService {
  private userRepository = new UserRepository();

  async createUser(name: string,email: string, password: string, roleId: number): Promise<number> {
    const user = {name, email, password, roleId};
    return await this.userRepository.createUser(user);
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.getUsers();
  }

  async getUserByEmail(email: string): Promise<User> {
    const user =  await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
