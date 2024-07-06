import { Socket, io } from 'socket.io-client';
import PromptUtils from '../utils/PromptUtils';
import * as dotenv from 'dotenv';
import AdminClient from '../ClientController/admin.client';
import ChefClient from '../ClientController/chef.client';
import EmployeeClient from '../ClientController/employee.client';
import { UserRole } from '../Enums/userRoles.enum';
import { SocketEvent } from '../Enums/socketEvent.enum';
import { User } from '../Interface/User';
import { RequestInterface } from '../Interface/Request';

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
        this.socket.on(SocketEvent.CLIENT_CONNECT, () => {
            console.log('Welcome to Cafeteria Management! \nPlease enter user credentials to login: ');
            this.getUserCreds();
        });
        this.socket.on(SocketEvent.DISCONNECT, this.disconnect);
        this.checkLoginStatus();
    }

    protected async handleRequest(User: User, event?: string, selectedOption?: number) {
        let payload: RequestInterface = {};
        switch (User.role) {
            case UserRole.Admin:
                payload =  await this.adminClient.requestHandler(User);
                break;
            case UserRole.Chef:
                payload =  await this.chefClient.requestHandler(User,event,selectedOption);
                break;
            case UserRole.Employee:
                payload = await this.employeeClient.requestHandler(User,event,selectedOption);
                break;
        }
        payload.user = {id: User.id, role: User.role};
        this.socket.emit(SocketEvent.REQUEST,payload);
    }

    async getUserCreds() {
        try {
            const email = await PromptUtils.promptMessage('Enter email: ');
            const password = await PromptUtils.promptMessage('Enter password: ');
            this.socket.emit(SocketEvent.AUTHETICATION, { email, password });
        } catch (err) {
            console.error('Error getting user credentials:', err);
        }
    }

    checkLoginStatus() {
        this.socket.on(SocketEvent.LOGIN, async(loginUser: any) => {
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
        this.socket.on(SocketEvent.RESPONSE, async (response: any) => {
            switch(user.role) {
                case UserRole.Admin:
                    await this.adminClient.responseHandler(response);
                    break;
                case UserRole.Chef:
                    await this.chefClient.responseHandler(response);
                    break;
                case UserRole.Employee:
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
