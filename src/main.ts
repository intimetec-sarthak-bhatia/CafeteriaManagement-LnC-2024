import { User } from './Interface/User';
import { UserService } from './Services/user';

async function main() {
  const userService = new UserService();

  try {
    // Create a new user with role
    console.log('Creating a new user with role...');
    const user: User = {
      email: 'first@gmail.com',
      name: 'First',
      password: '123456789',
      roleId: 0
    };

    const roleId = await userService.createUserWithRole(user.email,user.name,user.password, 6);
    console.log('Created user with role id:', roleId);

    // Fetch all users
    console.log('Fetching all users...');
    const users = await userService.getUsers();
    console.log('Fetched users:', users);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
