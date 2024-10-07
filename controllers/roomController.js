const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
    const { name, description, capacity } = req.body;

    if (!name || !description || !capacity) {
        return res.status(400).json({ message: 'Nome, descrição e capacidade são obrigatórios.' });
    }

    const room = new Room({ name, description, capacity, participants: [] });
    try {
        await room.save();
        res.status(201).json({ message: 'Sala criada com sucesso!', room });
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        res.status(500).json({ message: 'Erro ao criar sala.' });
    }
};

exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);
    } catch (error) {
        console.error('Erro ao buscar salas:', error);
        res.status(500).json({ message: 'Erro ao buscar salas.' });
    }
};
