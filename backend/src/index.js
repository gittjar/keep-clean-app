import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import toiletRoutes from './routes/toilets.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/toilets', toiletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Keep Clean Backend running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
