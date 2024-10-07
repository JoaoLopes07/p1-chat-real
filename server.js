const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { router: authRoutes, authenticateJWT } = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const connectDB = require('./config/database');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 4000;
connectDB();

let userCount = 0;

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', roomRoutes);

app.post('/api/send-message', async (req, res) => {
    const { roomId, content, from } = req.body;

    console.log(`[${from}] ${content}`); 

    req.io.to(roomId).emit('message', { from, content });

    return res.status(200).json({ message: 'Mensagem enviada!', from, content });
});

io.on('connection', (socket) => {
    userCount += 1;
    const username = `Usuario${userCount}`;
    socket.username = username;

    console.log(`${username} se conectou com ID: ${socket.id}`);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`${socket.username} entrou na ${roomId}`);
        io.to(roomId).emit('notification', `${socket.username} entrou na ${roomId}`);
    });

    socket.on('message', (data) => {
        console.log(`[${socket.username}] ${data.content}`);
        io.to(data.roomId).emit('message', {
            from: socket.username,
            content: data.content,
        });
    });

    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        console.log(`${socket.username} saiu da ${roomId}`);
        io.to(roomId).emit('notification', `${socket.username} saiu da ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log(`${socket.username} desconectou.`);
    });
});

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
