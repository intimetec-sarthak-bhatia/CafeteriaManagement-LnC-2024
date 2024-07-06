import { MenuItemService } from "../Services/menuItem";
import { UserService } from "../Services/user";
import { MenuItem } from "../Interface/MenuItem";
import { ResponseInterface } from "../Interface/Response";

class AdminController {

    private userService: UserService;
    private menuItem: MenuItemService;

    constructor() {
        this.userService = new UserService();
        this.menuItem = new MenuItemService();
        
    }
    
    async handleRequest(payload) {
        const args = payload.data;
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


    private async addEmployee(name: string, email:string , password: string, role: number): Promise<any> {
        const result = await this.userService.createUser(name, email, password, role);
        return {data: result, dataType: 'message', event: 'addEmployee'};
    }

    private async addMenuItem(name: string, mealType: string, price: string, availability: string): Promise<any> {
        const result = await this.menuItem.addMenuItem(name, parseInt(mealType), parseInt(price), parseInt(availability));
        return {data: result, dataType: 'message', event: 'addMenuItem'};
    }

    private async viewAllMenuItems(): Promise<any> {
        const result = await this.menuItem.getAll();
        return {data: result, dataType: 'table', event: 'viewMenu'};
    }

    private async updatePrice( name: string, price: string): Promise<any> {
        const result = await this.menuItem.updatePrice(parseFloat(price), name);
        return {data: result, dataType: 'message', event: 'updatePrice'};
    }

    private async updateAvailability( name: string, availability: string): Promise<any> {
        const result = await this.menuItem.updateAvailability(parseInt(availability), name);
        return {data: result, dataType: 'message', event: 'updateAvailability'};
    }
}

export default AdminController;

