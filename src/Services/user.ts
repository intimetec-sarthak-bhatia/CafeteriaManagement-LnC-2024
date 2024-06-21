import { UserRoleRepository } from '../Repository/userRole';
import { User } from '../Interface/User';
import { UserRepository } from '../Repository/user';

export class UserService {
  private userRepository = new UserRepository();

  async createUser(name: string,email: string, password: string, roleId: number): Promise<string> {
    const user = {name, email, password, roleId};
    const userId = await this.userRepository.createUser(user);
    return 'User added successfully! with id: ' + userId;
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
