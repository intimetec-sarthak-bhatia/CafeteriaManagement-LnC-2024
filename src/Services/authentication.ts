// auth.service.ts
import { User } from '../Entity/User';
import { UserService } from './user';

class AuthService {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async validateUser(email: string, password: string): Promise<User | null> {
            const user = await this.userService.getUserByEmail(email);
            if(!user) return null;
            if (user && user.password === password) {
                return user;
            }
            return null
    }
}

export default AuthService;
