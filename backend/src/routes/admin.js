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

// PUT /api/admin/users/:id/username – muuta käyttäjänimi
router.put('/users/:id/username', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.trim().length < 2) {
      return res.status(400).json({ message: 'Käyttäjänimi liian lyhyt (min 2 merkkiä)' });
    }
    const existing = await User.findOne({ username: username.trim() });
    if (existing && existing._id.toString() !== req.params.id) {
      return res.status(400).json({ message: 'Käyttäjänimi on jo käytössä' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id, { username: username.trim() }, { new: true }
    ).select('-pin');
    if (!user) return res.status(404).json({ message: 'Käyttäjää ei löydy' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Päivitys epäonnistui', error: err.message });
  }
});

// PUT /api/admin/users/:id/pin – vaihda käyttäjän PIN
router.put('/users/:id/pin', async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length < 4) {
      return res.status(400).json({ message: 'PIN liian lyhyt (min 4 merkkiä)' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Käyttäjää ei löydy' });
    user.pin = pin; // pre-save hook hashaa automaattisesti
    await user.save();
    res.json({ message: 'PIN vaihdettu' });
  } catch (err) {
    res.status(500).json({ message: 'PIN-vaihto epäonnistui', error: err.message });
  }
});

// PUT /api/admin/users/:id/freeze – jäädytä käyttäjä N päiväksi (0 = poista jäädytys)
router.put('/users/:id/freeze', async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Et voi jäädyttää omaa tiliäsi' });
    }
    const { days } = req.body;
    const frozenUntil = days > 0
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      : null;
    const user = await User.findByIdAndUpdate(
      req.params.id, { frozenUntil }, { new: true }
    ).select('-pin');
    if (!user) return res.status(404).json({ message: 'Käyttäjää ei löydy' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Jäädytys epäonnistui', error: err.message });
  }
});

// DELETE /api/admin/users/:id – poista käyttäjä
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Et voi poistaa omaa tiliäsi' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Käyttäjää ei löydy' });
    res.json({ message: `Käyttäjä ${user.username} poistettu` });
  } catch (err) {
    res.status(500).json({ message: 'Poisto epäonnistui', error: err.message });
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
