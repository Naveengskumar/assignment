import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middlewares/error.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import { config } from './config/env.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// v1 API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

app.post('/api/v1/notify/task', (req, res) => {
  const io = req.app.get('io');
  if (!io) {
    return res.status(503).json({ error: 'Socket server not ready' });
  }
  const { title = 'New Task Assigned', message = 'Check your dashboard.', assignedBy = 'Admin' } = req.body || {};
  const payload = {
    id: Date.now(),
    title,
    message,
    assignedBy,
    createdAt: new Date().toISOString(),
  };
  io.emit('task:assigned', payload);
  res.json({ ok: true, emitted: payload });
});

// 404 + error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
