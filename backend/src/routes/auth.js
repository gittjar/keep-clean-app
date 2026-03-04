import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// POST /api/auth/register – luo uusi käyttäjä PIN-koodilla
router.post('/register', async (req, res) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin) {
      return res.status(400).json({ message: 'Käyttäjänimi ja PIN vaaditaan' });
    }
    if (pin.length < 4) {
      return res.status(400).json({ message: 'PIN täytyy olla vähintään 4 merkkiä' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Käyttäjänimi on jo käytössä' });
    }

    const user = new User({ username, pin });
    await user.save();

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, username: user.username, userId: user._id });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Rekisteröinti epäonnistui', error: err.message });
  }
});

// POST /api/auth/login – kirjaudu PIN-koodilla
router.post('/login', async (req, res) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin) {
      return res.status(400).json({ message: 'Käyttäjänimi ja PIN vaaditaan' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Väärä käyttäjänimi tai PIN' });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json({ message: 'Väärä käyttäjänimi tai PIN' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, username: user.username, userId: user._id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Kirjautuminen epäonnistui', error: err.message });
  }
});

export default router;
