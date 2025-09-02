// server.js
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

async function bootstrap() {
  try {
    await connectDB();

    // 1) Create HTTP server *from* Express app
    const httpServer = http.createServer(app);

    // 2) Attach Socket.IO
    const io = new Server(httpServer, {
      cors: {
        origin: Array.isArray(config.corsOrigin) ? config.corsOrigin : [config.corsOrigin],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // 3) Make io available inside routes/middlewares
    app.set('io', io);

    // 4) Optional connection logs
    io.on('connection', (socket) => {
      console.log('⚡ client connected:', socket.id);
      socket.on('disconnect', (reason) => {
        console.log('👋 client disconnected:', socket.id, reason);
      });
    });

    // 5) Demo periodic emitter (every 15s by default)
    const tickMs = Number(process.env.DEMO_TICK_MS || 15000);
    setInterval(() => {
      const payload = {
        id: Date.now(),
        title: 'New Task Assigned',
        message: 'You’ve been assigned a new task. Tap to view details.',
        assignedBy: 'System Bot',
        createdAt: new Date().toISOString(),
      };
      io.emit('task:assigned', payload);
      console.log('📣 emitted task:assigned', payload.id);
    }, tickMs);

    // 6) Start HTTP server (not app.listen anymore)
    httpServer.listen(config.port, () => {
      console.log(`🚀 API + Socket.IO listening on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
}

bootstrap();
