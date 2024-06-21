import { Socket } from 'socket.io';

class AdminController {
    constructor(private socket: Socket) {
        this.adminRoutes();
        
    }

    public async adminRoutes() {
        this.socket.on('admin', async (payload: any) => {
            const { path, selectedOption, answers } = payload;

            switch (path) {
                case 'addUser':
                    await this.handleAddUser(answers);
                    break;
                case 'addMenuItem':
                    await this.handleAddMenuItem(answers);
                    break;
                case 'viewMenuItems':
                    await this.handleViewMenuItems();
                    break;
                case 'updateMenuItemPrice':
                    await this.handleUpdateMenuItemPrice(answers);
                    break;
                case 'updateMenuItemAvailability':
                    await this.handleUpdateMenuItemAvailability(answers);
                    break;
                default:
                    this.socket.emit('option-response', { selectedOption, response: 'Invalid path.' });
                    break;
            }
        });
    }

    private async handleAddUser(answers: { [key: string]: string }) {
        // Implement logic to add a user based on answers
        this.socket.emit('option-response', { response: 'Add User logic executed.' });
    }

    private async handleAddMenuItem(answers: { [key: string]: string }) {
        // Implement logic to add a menu item based on answers
        this.socket.emit('option-response', { response: 'Add Menu Item logic executed.' });
    }

    private async handleViewMenuItems() {
        // Implement logic to view menu items
        this.socket.emit('option-response', { response: 'View Menu Items logic executed.' });
    }

    private async handleUpdateMenuItemPrice(answers: { [key: string]: string }) {
        // Implement logic to update menu item price based on answers
        this.socket.emit('option-response', { response: 'Update Menu Item Price logic executed.' });
    }

    private async handleUpdateMenuItemAvailability(answers: { [key: string]: string }) {
        // Implement logic to update menu item availability based on answers
        this.socket.emit('option-response', { response: 'Update Menu Item Availability logic executed.' });
    }
}

export default AdminController;
