import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB, isUsingJsonDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/tool', toolRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/history', historyRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

connectDB().then((status) => {
  app.listen(PORT, () => {
    if (status.isMock) {
      console.log(`[DB] Running on fallback JSON Local Database`);
    } else {
      console.log(`[DB] Connected to MongoDB`);
    }
    console.log(`Server listening on port ${PORT}`);
  });
});
