import { UnauthorizedError } from "../Exceptions/unauthorized-exception";
import { User } from "../Interface/User";
import { UserService } from "./user";

class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    throw new UnauthorizedError("Invalid Credentials!");
  }
}

export default AuthService;
