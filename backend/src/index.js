import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/auth.js';
import toiletRoutes from './routes/toilets.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());

// Reitit
app.use('/api/auth', authRoutes);
app.use('/api/toilets', toiletRoutes);

app.get('/', (req, res) => {
  res.send('Keep Clean Backend running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
