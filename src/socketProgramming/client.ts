import { Socket, io } from 'socket.io-client';
import { readLine } from '../utils/readline';
import PromptUtils from '../utils/PromptUtils';
import AdminClient from './adminClient';
import GetOptions from './adminClient';

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

    protected proceedLogin(User) {
        console.log(`${User.role} logged in successfully`);
        const options = this.getOptionsByRole.getOptionsByRole(User.role);
        options.map((option, index) => {
            console.log(`${index + 1}. ${option}`);
        });
        const selectedOption = PromptUtils.promptMessage('Enter your choice: ');
        this.socket.emit('user-options', selectedOption, User.role);
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
        this.socket.on('login', (loginUser: any) => {
            if (!loginUser) {
                console.log('Invalid Credentials! Please try again');
                this.getUserCreds();
            } else {
                console.log('Welcome !', loginUser);
                const option = this.proceedLogin(loginUser)
                this.socket.emit('user-options', option, loginUser.role);
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

const client = new CafeteriaManagementClient('http://localhost:4000');

export default CafeteriaManagementClient;
