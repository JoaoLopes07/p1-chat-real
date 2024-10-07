const express = require('express'); 
const { createRoom, getRooms } = require('../controllers/roomController'); 
const { authenticateJWT } = require('../routes/auth'); 
const router = express.Router(); 

router.post('/rooms', authenticateJWT, createRoom);

router.get('/rooms', authenticateJWT, getRooms); 

router.post('/rooms/:id/join', authenticateJWT, async (req, res) => { 
    const roomId = req.params.id;
    const userId = req.user.id; 

    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Sala não encontrada.' });
        }

        if (room.participants.includes(userId)) {
            return res.status(400).json({ message: 'Usuário já está na sala.' });
        }

        room.participants.push(userId);
        await room.save();

        req.io.to(roomId).emit('user-joined', { userId, roomId });

        res.status(200).json({ message: 'Usuário entrou na sala com sucesso!', room });
    } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        res.status(500).json({ message: 'Erro ao entrar na sala.' });
    }
});

router.post('/rooms/:id/leave', authenticateJWT, async (req, res) => { 
    const roomId = req.params.id;
    const userId = req.user.id; 

    try {
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Sala não encontrada.' });
        }

        if (!room.participants.includes(userId)) {
            return res.status(400).json({ message: 'Usuário não está na sala.' });
        }

        room.participants.pull(userId);
        await room.save();

        req.io.to(roomId).emit('user-left', { userId, roomId });

        res.status(200).json({ message: 'Usuário saiu da sala com sucesso!', room });
    } catch (error) {
        console.error('Erro ao sair da sala:', error);
        res.status(500).json({ message: 'Erro ao sair da sala.' });
    }
});

module.exports = router;
