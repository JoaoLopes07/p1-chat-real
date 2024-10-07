const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User'); 

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    
    await newUser.save();
    res.status(201).json({ message: "Usuário criado com sucesso!" });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Credenciais inválidas!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};


module.exports = {
    router, 
    authenticateJWT
};
