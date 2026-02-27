// Backend entry point

import express from 'express';
import connectDB from './db.js';


const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Keep Clean Backend running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
