const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RoomSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => uuidv4(),
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
