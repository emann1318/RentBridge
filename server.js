import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './src/backend/routes/authRoutes.js';
import walletRoutes from './src/backend/routes/walletRoutes.js';
import adminRoutes from './src/backend/routes/adminRoutes.js';
import transactionRoutes from './src/backend/routes/transactionRoutes.js';
import expenseRoutes from './src/backend/routes/expenseRoutes.js';
import loanRoutes from './src/backend/routes/loanRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false, // For development ease with Vite
  }));
  app.use(morgan('dev'));
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/loans', loanRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'RentBridge' });
  });

  // TODO: Add actual API routes here
  // app.use('/api/auth', authRoutes);
  // app.use('/api/wallet', walletRoutes);
  // app.use('/api/transactions', transactionRoutes);

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RentBridge Server running on http://localhost:${PORT}`);
  });
}

startServer();
