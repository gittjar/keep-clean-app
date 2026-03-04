import express from 'express';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import Toilet from '../models/Toilet.js';

const router = express.Router();

// Vaatii kirjautumisen + admin-roolin
router.use(authMiddleware);
router.use((req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Admin-oikeus vaaditaan' });
  }
  next();
});

// GET /api/admin/users – kaikki käyttäjät
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-pin').sort({ createdAt: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Haku epäonnistui', error: err.message });
  }
});

// PUT /api/admin/users/:id/role – muuta käyttäjän roolia
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Roolin täytyy olla user tai admin' });
    }
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Et voi muuttaa omaa rooliasi' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-pin');
    if (!user) return res.status(404).json({ message: 'Käyttäjää ei löydy' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Päivitys epäonnistui', error: err.message });
  }
});

// GET /api/admin/toilets – kaikki WC-tilat omistajatiedoilla
router.get('/toilets', async (req, res) => {
  try {
    const toilets = await Toilet.find()
      .populate('owner', 'username')
      .populate('allowedUsers', 'username _id')
      .sort({ createdAt: 1 });
    res.json(toilets);
  } catch (err) {
    res.status(500).json({ message: 'Haku epäonnistui', error: err.message });
  }
});

export default router;
