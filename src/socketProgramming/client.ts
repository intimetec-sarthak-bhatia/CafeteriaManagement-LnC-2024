import { io } from 'socket.io-client';
import * as readline from 'readline';

const socket = io('http://localhost:4000');

socket.on('connect', () => {

    socket.on('server-message', (msg) => {
        console.log('\nReceived from server:', msg);
        promptMessage();
    });
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const promptMessage = () => {
    rl.question('', (msg) => {
        socket.emit('send-message', msg);
        promptMessage();
    });
};

promptMessage();
