import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import noteRoutes from './routes/note.routes';
import dashboardRoutes from './routes/dashboard.routes';
import sharedRoutes from './routes/shared.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/shared', sharedRoutes);

app.use(errorHandler);

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 NoteFlow API running on port ${PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing process or set PORT to a different value.`);
      process.exit(1);
    }
    throw err;
  });
});
