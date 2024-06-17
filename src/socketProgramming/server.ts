import { Server } from 'socket.io';
import * as readline from 'readline';
import { UserService } from '../User/user.service';

const io = new Server(4000);
const userService = new UserService();

io.on('connection', (socket) => {
    io.emit('server-message', initMessage);
    socket.on('send-message', async (msg) => {
        console.log('\nReceived from client:', msg);
        const [command, args] = msg.split(':');
        switch (command) {
            case 'Login':
                io.emit('server-message', 'Please Enter email and Password: ');
                socket.once('send-message', async (loginMsg: string) => {
                    const [email, password] = loginMsg.split(',');
                    try {
                        const user = await userService.getUserByEmail(email, password);
                        io.emit('server-message', `Login successful! Welcome, ${user.name}`);

                        if(user) {
                            const commands = await userService.getCommands(user.roleId);
                            io.emit('server-message', commands.join('\n'));

                        }
                    } catch (error) {
                        io.emit('server-message', `Login failed: ${error.message}`);
                    }
                });
                break;
            case 2 ||'Signup':
                io.emit('server-message', 'Enter firstName, email, password and roleId');
                socket.once('send-message', async (signupMsg) => {
                    const [name, signupEmail, signupPassword, roleId] = signupMsg.split(',');
                    try {
                        const newUser = await userService.createUserWithRole(name, signupEmail, signupPassword, roleId);
                        io.emit('server-message', `Registration successful! Welcome, ${name} with id ${newUser}`);
                    } catch (error) {
                        io.emit('server-message', `Registration failed: ${error.message}`);
                    }
                });
                break;
            case 3 || 'Exit':
                io.emit('server-message', 'Goodbye!');
                process.exit(0);
            default:
                io.emit('server-message', 'Invalid command. Please try again.');
                io.emit('server-message', initMessage);
                break;
        }
        // promptMessage();
    });
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const initMessage = "Choose one of the following commands: \n1. Login\n2. Signup\n3. Exit\n";
