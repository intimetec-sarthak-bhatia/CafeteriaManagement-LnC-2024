import { Socket, io } from 'socket.io-client';
import PromptUtils from '../utils/PromptUtils';
import GetOptions from '../utils/GetOptions';
import * as dotenv from 'dotenv';
import AdminClient from '../Client-Controller/admin.client';
import { RequestInterface } from '../Interface/request';
import ChefClient from '../Client-Controller/chef.client';
import EmployeeClient from '../Client-Controller/employee.client';

dotenv.config();


class CafeteriaManagementClient {
    protected socket: Socket;
    private adminClient: AdminClient;
    private chefClient: ChefClient;
    private employeeClient: EmployeeClient;

    constructor(protected serverUrl: string) {
        this.serverUrl = serverUrl;
        this.socket = io(this.serverUrl);
        this.initializeConnection()
        this.adminClient = new AdminClient();
        this.chefClient = new ChefClient();
        this.employeeClient = new EmployeeClient();
    }


    protected initializeConnection() {
        this.socket.on('connect', () => {
            console.log('Welcome to Cafeteria Management! \nPlease enter user credentials to login: ');
            this.getUserCreds();
        });
        this.socket.on('disconnect', this.disconnect);
        this.checkLoginStatus();
    }

    protected async handleRequest(User, event?: string, selectedOption?: number) {
        let payload: RequestInterface = {};
        switch (User.role) {
            case 'Admin':
                payload =  await this.adminClient.requestHandler(User);
                break;
            case 'Chef':
                payload =  await this.chefClient.requestHandler(User,event,selectedOption);
                break;
            case 'employee':
                payload = await this.employeeClient.requestHandler(User,event,selectedOption);
                break;
        }
        payload.user = {id: User.id, role: User.role};
        this.socket.emit('request',payload);
    }

    async getUserCreds() {
        try {
            const email = await PromptUtils.promptMessage('Enter email: ');
            const password = await PromptUtils.promptMessage('Enter password: ');
            this.socket.emit('authenticate', { email, password });
        } catch (err) {
            console.error('Error getting user credentials:', err);
        }
    }

    checkLoginStatus() {
        this.socket.on('login', async(loginUser: any) => {
            if (loginUser.error) {
                console.log('Error:', loginUser.error + '\nPlease try again');
                this.getUserCreds();
            } else {
                console.log('Welcome !', loginUser);
                console.log(`${loginUser.role} logged in successfully`);
                await this.handleRequest(loginUser)
                await this.handleResponse(loginUser);
                
            }
        });
    }

    async handleResponse(user) {
        this.socket.on('response', async (response: any) => {
            switch(user.role) {
                case 'Admin':
                    await this.adminClient.responseHandler(response);
                    break;
                case 'Chef':
                    await this.chefClient.responseHandler(response);
                    break;
                case 'employee':
                    await this.employeeClient.responseHandler(response);
                    break;
                default: 'Invalid role'
            }
            if(response.event === 'secondInteration') {
                await this.handleRequest(user,response.event, response.selectedOption);
                return;
            }

            console.log('\n Please select an option: \n 1. Main Menu \n 2. Logout');
            const selectedOption = await PromptUtils.promptMessage('Enter option: ');
            if(selectedOption === '1') {
                this.handleRequest(user);
            }
            else {
                this.disconnect();
            }

        });
    }

    disconnect = (): void => {
        console.log("Server disconnected !! Bbyee");
        this.socket.close();
      };
}

const client = new CafeteriaManagementClient(`http://localhost:${process.env.SERVER_PORT}`);

export default CafeteriaManagementClient;
