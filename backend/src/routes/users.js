import express from 'express';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/users – lista käyttäjistä (kirjautunut käyttäjä, omistajan oikeuksien myöntöä varten)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('username _id role').sort({ username: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Haku epäonnistui', error: err.message });
  }
});

export default router;
