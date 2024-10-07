const io = require('socket.io-client');
const readline = require('readline');  
const socket = io('http://localhost:4000');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let roomId = 'sala10';

const handleUserInput = () => {
    rl.question('Digite sua mensagem ou "sair" para sair da sala: ', (input) => {
        if (input.trim().toLowerCase() === 'sair') {
            socket.emit('leave-room', roomId);
            console.log(`Você saiu da ${roomId}`);
            rl.close();
        } else {
            socket.emit('message', {
                roomId: roomId,
                content: input,
            });
            handleUserInput();
        }
    });
};

socket.on('connect', () => {
    socket.emit('join-room', roomId);
    console.log(`Você entrou na ${roomId}`);
    handleUserInput();
});

socket.on('message', (data) => {
    console.log(`[${data.from}] ${data.content}`);
});

socket.on('notification', (message) => {
    console.log('Notificação:', message);
});

socket.on('disconnect', () => {
    console.log('Desconectado do servidor.');
});
