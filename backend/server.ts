import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import { seedDatabase } from './utils/seed';
import authRoutes from './routes/authRoutes';
import matchRoutes from './routes/matchRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import userRoutes from './routes/userRoutes';
import requestRoutes from './routes/requestRoutes';
import announcementRoutes from './routes/announcementRoutes';
import eventRoutes from './routes/eventRoutes';
import attendanceRoutes from './routes/attendanceRoutes';

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

  // Connect to DB and Seed
  await connectDB();
  await seedDatabase();

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/attendance', attendanceRoutes);

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
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Error handling
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({ message: 'Internal Server Error' });
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
