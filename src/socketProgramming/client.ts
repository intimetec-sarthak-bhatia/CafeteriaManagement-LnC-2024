import { Socket, io } from 'socket.io-client';
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
        this.getOptionsByRole = new GetOptions(this.socket);
    }


    protected initializeConnection() {
        this.socket.on('connect', async() => {
            console.log('Welcome to Cafeteria Management! \nPlease enter user credentials to login: ');
            const {email, password} = await this.getUserCreds();
            this.socket.emit('user-creds', { email, password});
            this.checkLoginStatus();
        });
        this.socket.on('disconnect', this.disconnect);
        
        this.initPublicHost()
    }

    protected async proceedAfterLogin(User) {
        const payload = await this.getOptionsByRole.getOptionsByRole(User.role);
        this.socket.emit('user-options', {payload: payload, role: User.role});
    }

    async initPublicHost() {
        const {email, password} = await this.getUserCreds();

        this.socket.emit('Authenticate', { userId: email, password });
        this.socket.on('Authenticate', (response: any) => {
            response.options.forEach((res: any, index: number) => {
                console.log( index + 1, res );
            });
        })
        const selectedOption = await PromptUtils.promptMessage('Enter your choice: ');
        const getAddMenuOptions = await this.getAddMenuOptions();
        
        this.socket.emit('Option selection',{selectedOption: selectedOption,payload:getAddMenuOptions});

        this.socket.on("Option Selection",(response) => {
            console.log(response.message);

        })
    }

    async getAddMenuOptions() {
        const categoryId = await PromptUtils.promptMessage('Enter Category ID : ');
        const name = await PromptUtils.promptMessage("Enter Item Name : ");
        const price = await PromptUtils.promptMessage("Enter Item Price : ");
        const availabilityStatus = await PromptUtils.promptMessage("Enter Availability Status : ")
        return {categoryId,name,price,availabilityStatus};
    }

    async getUserCreds() {
        try {
            const email = await PromptUtils.promptMessage('Enter email: ');
            const password = await PromptUtils.promptMessage('Enter password: ');
            return {email, password};
            // this.socket.emit('user-creds', { email, password });
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
        this.socket.on('option-response', async (serverResponse: any) => {
            console.log('Response:', serverResponse.response);
            console.log('\n Please select an option: \n 1. Main Menu \n 2. Logout');
            const selectedOption = await PromptUtils.promptMessage('Enter option: ');
            if(selectedOption === '1') {
                this.proceedAfterLogin(user);
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

const client = new CafeteriaManagementClient(`http://172.16.0.222:8081`);

export default CafeteriaManagementClient;
