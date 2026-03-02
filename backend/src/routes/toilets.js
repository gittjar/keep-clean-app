import express from 'express';
import Toilet from '../models/Toilet.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// PUBLIC: POST /api/toilets/:id/pin-reset – nollaa timer PIN-koodilla (display-näyttö)
router.post('/:id/pin-reset', async (req, res) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) {
      return res.status(400).json({ message: 'Käyttäjänimi ja PIN vaaditaan' });
    }

    const toilet = await Toilet.findById(req.params.id).populate('owner');
    if (!toilet) {
      return res.status(404).json({ message: 'WC-tilaa ei löydy' });
    }

    const owner = await User.findOne({ username });
    if (!owner || owner._id.toString() !== toilet.owner._id.toString()) {
      return res.status(401).json({ message: 'Väärä käyttäjänimi tai PIN' });
    }

    const isMatch = await owner.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json({ message: 'Väärä käyttäjänimi tai PIN' });
    }

    toilet.lastCleaned = new Date();
    await toilet.save();

    res.json({ message: 'Timer nollattu', lastCleaned: toilet.lastCleaned, toilet });
  } catch (err) {
    console.error('Pin-reset error:', err);
    res.status(500).json({ message: 'Nollaus epäonnistui', error: err.message });
  }
});

// PUBLIC: GET /api/toilets/:id/public – hae yksittäinen WC-tila ilman autentikaatiota
router.get('/:id/public', async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id).select('-owner');
    if (!toilet) return res.status(404).json({ message: 'WC-tilaa ei löydy' });
    res.json(toilet);
  } catch (err) {
    res.status(500).json({ message: 'Haku epäonnistui', error: err.message });
  }
});

// Kaikki alla olevat reitit vaativat kirjautumisen
router.use(authMiddleware);

// GET /api/toilets – hae kaikki käyttäjän WC-tilat
router.get('/', async (req, res) => {
  try {
    const toilets = await Toilet.find({ owner: req.userId }).sort({ createdAt: 1 });
    res.json(toilets);
  } catch (err) {
    res.status(500).json({ message: 'Haku epäonnistui', error: err.message });
  }
});

// POST /api/toilets – lisää uusi WC-tila
router.post('/', async (req, res) => {
  try {
    const { name, location, toiletId } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Nimi ja sijainti vaaditaan' });
    }

    const toilet = new Toilet({
      name,
      location,
      toiletId: toiletId || '',
      owner: req.userId,
      lastCleaned: new Date(),
    });

    await toilet.save();
    res.status(201).json(toilet);
  } catch (err) {
    res.status(500).json({ message: 'Lisäys epäonnistui', error: err.message });
  }
});

// PUT /api/toilets/:id/reset – nollaa timer (merkitse siivotuksi)
router.put('/:id/reset', async (req, res) => {
  try {
    const toilet = await Toilet.findOne({ _id: req.params.id, owner: req.userId });

    if (!toilet) {
      return res.status(404).json({ message: 'WC-tilaa ei löydy' });
    }

    toilet.lastCleaned = new Date();
    await toilet.save();

    res.json({ message: 'Timer nollattu', lastCleaned: toilet.lastCleaned, toilet });
  } catch (err) {
    res.status(500).json({ message: 'Nollaus epäonnistui', error: err.message });
  }
});

// PUT /api/toilets/:id – päivitä WC-tilan tiedot
router.put('/:id', async (req, res) => {
  try {
    const { name, location, toiletId } = req.body;
    const toilet = await Toilet.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { name, location, toiletId },
      { new: true }
    );

    if (!toilet) {
      return res.status(404).json({ message: 'WC-tilaa ei löydy' });
    }

    res.json(toilet);
  } catch (err) {
    res.status(500).json({ message: 'Päivitys epäonnistui', error: err.message });
  }
});

// DELETE /api/toilets/:id – poista WC-tila
router.delete('/:id', async (req, res) => {
  try {
    const toilet = await Toilet.findOneAndDelete({ _id: req.params.id, owner: req.userId });

    if (!toilet) {
      return res.status(404).json({ message: 'WC-tilaa ei löydy' });
    }

    res.json({ message: 'WC-tila poistettu' });
  } catch (err) {
    res.status(500).json({ message: 'Poisto epäonnistui', error: err.message });
  }
});

export default router;
