import { Socket, io } from 'socket.io-client';
import { readLine } from '../utils/readline';
import PromptUtils from '../utils/PromptUtils';
import GetOptions from '../utils/GetOptions';
import * as dotenv from 'dotenv';

dotenv.config();


class CafeteriaManagementClient {
    protected socket: Socket;
    private getOptionsByRole: GetOptions;

    constructor(protected serverUrl: string) {
        this.serverUrl = serverUrl;
        this.socket = io(this.serverUrl);
        this.initializeConnection()
        this.getOptionsByRole = new GetOptions();
        // this.checkLoginStatus();
    }


    protected initializeConnection() {
        this.socket.on('connect', () => {
            console.log('Welcome to Cafeteria Management! \nPlease enter user credentials to login: ');
            this.getUserCreds();
        });
        this.socket.on('disconnect', this.disconnect);
        this.checkLoginStatus();
        
        
    }

    protected async proceedAfterLogin(User) {
        const payload = await this.getOptionsByRole.getOptionsByRole(User.role);
        this.socket.emit('user-options', {payload: payload, role: User.role});
    }

    async getUserCreds() {
        try {
            const email = await PromptUtils.promptMessage('Enter email: ');
            const password = await PromptUtils.promptMessage('Enter password: ');
            this.socket.emit('user-creds', { email, password });
        } catch (err) {
            console.error('Error getting user credentials:', err);
        }
    }

    checkLoginStatus() {
        this.socket.on('login', async(loginUser: any) => {
            if (!loginUser) {
                console.log('Invalid Credentials! Please try again');
                this.getUserCreds();
            } else {
                console.log('Welcome !', loginUser);
                console.log(`${loginUser.role} logged in successfully`);
                const option = this.proceedAfterLogin(loginUser)
                this.socket.emit('user-options', option, loginUser.role);
                await this.handleUserOptionResponse(loginUser);
                
            }
        });
    }

    async handleUserOptionResponse(user) {
        this.socket.on('option-response', async (response: any) => {
            console.log('Response:', response.response, '\n Please select an option: \n 1. Main Menu \n 2. Logout');
            const selectedOption = await PromptUtils.promptMessage('Enter option: ');
            if(selectedOption === '1') {
                this.proceedAfterLogin(user);
            }
            else {
                this.disconnect();
            }

        });
    }


    promptMessage(message: string): Promise<string> {
        return new Promise((resolve) => {
            readLine.question(message, (ans: string) => {
                resolve(ans);
            });
        });
    }

    disconnect = (): void => {
        console.log("Server disconnected !! Bbyee");
        this.socket.close();
      };
}

const client = new CafeteriaManagementClient(`http://localhost:${process.env.SERVER_PORT}`);

export default CafeteriaManagementClient;
