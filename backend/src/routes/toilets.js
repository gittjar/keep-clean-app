import express from 'express';
import Toilet from '../models/Toilet.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Helper: tarkista pääsyoikeus
function hasAccess(toilet, userId, role) {
  const ownerId = toilet.owner._id ? toilet.owner._id.toString() : toilet.owner.toString();
  const isOwner = ownerId === userId;
  const isAllowed = toilet.allowedUsers.map(id => id.toString()).includes(userId);
  return isOwner || isAllowed || role === 'admin';
}

// PUBLIC: POST /api/toilets/:id/pin-reset
router.post('/:id/pin-reset', async (req, res) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) {
      return res.status(400).json({ message: 'Käyttäjänimi ja PIN vaaditaan' });
    }

    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) return res.status(404).json({ message: 'WC-tilaa ei löydy' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Väärä käyttäjänimi tai PIN' });

    const isOwner = toilet.owner.toString() === user._id.toString();
    const isAllowed = toilet.allowedUsers.map(id => id.toString()).includes(user._id.toString());
    if (!isOwner && !isAllowed) {
      return res.status(401).json({ message: 'Ei oikeutta nollata tätä tilaa' });
    }

    const isMatch = await user.comparePin(pin);
    if (!isMatch) return res.status(401).json({ message: 'Väärä PIN' });

    toilet.cleaningLog.push({ cleanedAt: new Date(), cleanedBy: user.username });
    await toilet.save();

    res.json({ message: 'Timer nollattu', lastCleaned: toilet.lastCleaned, toilet });
  } catch (err) {
    console.error('Pin-reset error:', err);
    res.status(500).json({ message: 'Nollaus epäonnistui', error: err.message });
  }
});

// PUBLIC: GET /api/toilets/:id/public
router.get('/:id/public', async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id).select('-owner -allowedUsers');
    if (!toilet) return res.status(404).json({ message: 'WC-tilaa ei löydy' });
    res.json(toilet);
  } catch (err) {
    res.status(500).json({ message: 'Haku epäonnistui', error: err.message });
  }
});

router.use(authMiddleware);

// GET /api/toilets â€“ omat + myönnetyt tilat
router.get('/', async (req, res) => {
  try {
    const query = req.role === 'admin'
      ? {}
      : { $or: [{ owner: req.userId }, { allowedUsers: req.userId }] };
    const toilets = await Toilet.find(query)
      .populate('owner', 'username')
      .populate('allowedUsers', 'username _id')
      .sort({ createdAt: 1 });
    res.json(toilets);
  } catch (err) {
    res.status(500).json({ message: 'Haku epäonnistui', error: err.message });
  }
});

// POST /api/toilets â€“ lisää uusi WC-tila
router.post('/', async (req, res) => {
  try {
    const { name, location, toiletId } = req.body;
    if (!name || !location) {
      return res.status(400).json({ message: 'Nimi ja sijainti vaaditaan' });
    }
    const toilet = new Toilet({ name, location, toiletId: toiletId || '', owner: req.userId });
    await toilet.save();
    await toilet.populate('owner', 'username');
    res.status(201).json(toilet);
  } catch (err) {
    res.status(500).json({ message: 'Lisäys epäonnistui', error: err.message });
  }
});

// PUT /api/toilets/:id/reset â€“ nollaa timer (owner, allowedUser, admin)
router.put('/:id/reset', async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) return res.status(404).json({ message: 'WC-tilaa ei löydy' });

    if (!hasAccess(toilet, req.userId, req.role)) {
      return res.status(403).json({ message: 'Ei oikeutta nollata tätä tilaa' });
    }

    toilet.cleaningLog.push({ cleanedAt: new Date(), cleanedBy: req.username });
    await toilet.save();
    res.json({ message: 'Timer nollattu', lastCleaned: toilet.lastCleaned, toilet });
  } catch (err) {
    res.status(500).json({ message: 'Nollaus epäonnistui', error: err.message });
  }
});

// POST /api/toilets/:id/grant â€“ myönnä oikeus (owner tai admin)
router.post('/:id/grant', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId vaaditaan' });

    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) return res.status(404).json({ message: 'WC-tilaa ei löydy' });

    const isOwner = toilet.owner.toString() === req.userId;
    if (!isOwner && req.role !== 'admin') {
      return res.status(403).json({ message: 'Vain omistaja tai admin voi myöntää oikeuksia' });
    }
    if (toilet.owner.toString() === userId) {
      return res.status(400).json({ message: 'Omistajalla on jo täydet oikeudet' });
    }
    if (toilet.allowedUsers.map(id => id.toString()).includes(userId)) {
      return res.status(409).json({ message: 'Käyttäjällä on jo oikeus' });
    }

    toilet.allowedUsers.push(userId);
    await toilet.save();
    await toilet.populate('allowedUsers', 'username _id');
    res.json({ message: 'Oikeus myönnetty', toilet });
  } catch (err) {
    res.status(500).json({ message: 'Myöntäminen epäonnistui', error: err.message });
  }
});

// DELETE /api/toilets/:id/revoke/:userId â€“ poista oikeus (owner tai admin)
router.delete('/:id/revoke/:targetUserId', async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) return res.status(404).json({ message: 'WC-tilaa ei löydy' });

    const isOwner = toilet.owner.toString() === req.userId;
    if (!isOwner && req.role !== 'admin') {
      return res.status(403).json({ message: 'Vain omistaja tai admin voi poistaa oikeuksia' });
    }

    toilet.allowedUsers = toilet.allowedUsers.filter(
      id => id.toString() !== req.params.targetUserId
    );
    await toilet.save();
    res.json({ message: 'Oikeus poistettu' });
  } catch (err) {
    res.status(500).json({ message: 'Poistaminen epäonnistui', error: err.message });
  }
});

// PUT /api/toilets/:id â€“ päivitä tiedot (owner tai admin)
router.put('/:id', async (req, res) => {
  try {
    const { name, location, toiletId } = req.body;
    const filter = req.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, owner: req.userId };
    const toilet = await Toilet.findOneAndUpdate(filter, { name, location, toiletId }, { new: true });
    if (!toilet) return res.status(404).json({ message: 'WC-tilaa ei löydy' });
    res.json(toilet);
  } catch (err) {
    res.status(500).json({ message: 'Päivitys epäonnistui', error: err.message });
  }
});

// DELETE /api/toilets/:id â€“ poista (owner tai admin)
router.delete('/:id', async (req, res) => {
  try {
    const filter = req.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, owner: req.userId };
    const toilet = await Toilet.findOneAndDelete(filter);
    if (!toilet) return res.status(404).json({ message: 'WC-tilaa ei löydy' });
    res.json({ message: 'WC-tila poistettu' });
  } catch (err) {
    res.status(500).json({ message: 'Poisto epäonnistui', error: err.message });
  }
});

export default router;
