import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import { getMatches, createMatch, deleteAllMatches } from './controllers/matchController';
import { authenticateToken } from './middleware/auth';
import inventoryRoutes from './routes/inventoryRoutes';
import userRoutes from './routes/userRoutes';
import requestRoutes from './routes/requestRoutes';
import announcementRoutes from './routes/announcementRoutes';
import eventRoutes from './routes/eventRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import achievementRoutes from './routes/achievementRoutes';
import alumniRoutes from './routes/alumniRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log('Starting server initialization...');
  
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Middleware
  app.use(express.json());
  app.use(cors());

  // Connect to DB
  await connectDB();

  // Routes
  app.use('/api/auth', authRoutes);
  app.get('/api/matches', authenticateToken, getMatches);
  app.post('/api/matches', authenticateToken, createMatch);
  app.post('/api/reset-leaderboard', authenticateToken, deleteAllMatches);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/achievements', achievementRoutes);
  app.use('/api/alumni', alumniRoutes);
  app.use('/api/uploads', uploadRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      configFile: path.join(process.cwd(), 'vite.config.ts'),
      server: { 
        middlewareMode: true,
        hmr: false,
        fs: {
          allow: [
            path.join(process.cwd()) // Allow access to root directory
          ]
        }
      },
      appType: 'spa',
      root: path.join(process.cwd(), 'frontend')
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath) );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ message: 'Internal Server Error' });
  });

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Error handling
  
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
