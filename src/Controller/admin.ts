import { MenuItemService } from "../Services/menuItem";
import { UserService } from "../Services/user";
import { MenuItem } from "../entity/MenuItem";

class AdminController {

    private userService: UserService;
    private menuItem: MenuItemService;

    constructor() {
        this.userService = new UserService();
        this.menuItem = new MenuItemService();
        
    }
    
    async handleRequest(payload) {
        const args = payload.answers;
        switch(payload.selectedOption) {
            case 1:
                return await this.addEmployee(args.arg1, args.arg2, args.arg3, args.arg4);
            case 2:
                return await this.addMenuItem(args.arg1, args.arg2, args.arg3, args.arg4);
            case 3:
                return await this.viewAllMenuItems();
            case 4:
                return await this.updatePrice(args.arg1, args.arg2);
            case 5:
                return await this.updateAvailability(args.arg1, args.arg2);
            default:
                return 'Invalid option';
        }

    }


    private async addEmployee(name: string, email:string , password: string, role: number): Promise<string> {
        const userId = await this.userService.createUser(name, email, password, role);
        return 'User added successfully with id:'+ userId;
    }

    private async addMenuItem(name: string, mealType: string, price: string, availability: string): Promise<string> {
        const result = await this.menuItem.addMenuItem(name, parseInt(mealType), parseInt(price), parseInt(availability));
        return result;
    }

    private async viewAllMenuItems(): Promise<MenuItem[]> {
        const result = await this.menuItem.getAll();
        return result
    }

    private async updatePrice( name: string, price: string): Promise<string> {
        const result = await this.menuItem.updatePrice(parseFloat(price), name);
        return result;
    }

    private async updateAvailability( name: string, availability: string): Promise<string> {
        const result = await this.menuItem.updateAvailability(parseInt(availability), name);
        return result;
    }
}

export default AdminController;

