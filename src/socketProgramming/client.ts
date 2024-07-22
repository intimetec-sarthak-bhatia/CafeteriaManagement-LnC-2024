import { Socket, io } from 'socket.io-client';
import PromptUtils from '../Utils/promptUtils';
import * as dotenv from 'dotenv';
import AdminClient from '../ClientController/admin.client';
import ChefClient from '../ClientController/chef.client';
import EmployeeClient from '../ClientController/employee.client';
import { UserRole } from '../Enums/userRoles.enum';
import { User } from '../Interface/User';
import { ResponseInterface } from '../Interface/Response';
import { SocketEvent } from '../Enums/socketEvent.enum';
import { RequestInterface } from '../Interface/request';

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
    }


    protected initializeConnection() {
        this.socket.on(SocketEvent.CLIENT_CONNECT, this.handleClientConnect);
        this.socket.on(SocketEvent.DISCONNECT, this.disconnect);
        this.checkLoginStatus();
    }

    private handleClientConnect = (): void => {
        console.log('Welcome to Cafeteria Management! \nPlease enter user credentials to login: ');
        this.getUserCreds();
    }

    protected async handleRequest(User: User, event?: string, selectedOption?: number) {
        let payload: RequestInterface = {};
        switch (User.role) {
            case UserRole.Admin:
                this.adminClient = new AdminClient(User.role);
                payload =  await this.adminClient.requestHandler();
                break;
            case UserRole.Chef:
                this.chefClient = new ChefClient(User.role);
                payload =  await this.chefClient.requestHandler(event,selectedOption);
                break;
            case UserRole.Employee:
                this.employeeClient = new EmployeeClient(User.role);
                payload = await this.employeeClient.requestHandler(event,selectedOption);
                break;
        }
        if(payload.data === 'logout') { 
            this.disconnect();
            return;
        }
        payload.user = {id: User.id, role: User.role};
        this.socket.emit(SocketEvent.REQUEST,payload);
    }

    private async getUserCreds(): Promise<void> {
        try {
            const email = await PromptUtils.promptMessage('Enter email: ');
            const password = await PromptUtils.promptMessage('Enter password: ');
            this.socket.emit(SocketEvent.AUTHETICATION, { email, password });
        } catch (err) {
            console.error('Error getting user credentials:', err);
        }
    }

    private checkLoginStatus(): void {
        this.socket.on(SocketEvent.LOGIN, this.handleLoginStatus);
    }

    private handleLoginStatus = async (loginUser: any): Promise<void> => {
        if (loginUser.error) {
            console.log('Error:', loginUser.error + '\nPlease try again');
            this.getUserCreds();
        } else {
            console.log('Welcome !', loginUser);
            console.log(`${loginUser.role} logged in successfully`);
            await this.handleRequest(loginUser);
            await this.handleResponse(loginUser);
        }
    }

    async handleResponse(user: User): Promise<void> {
        this.socket.on(SocketEvent.RESPONSE, async (response: ResponseInterface) => {
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
            response.event === 'secondInteration' ? await this.handleRequest(user,response.event, response.selectedOption) : await this.handleRequest(user);
            return;

        });
    }

    private disconnect = (): void => {
        console.log("Server disconnected !! Bbyee");
        this.socket.close();
      };
}

const client = new CafeteriaManagementClient(`http://localhost:${process.env.SERVER_PORT}`);

export default CafeteriaManagementClient;
