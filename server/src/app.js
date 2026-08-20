import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import crypto from 'node:crypto';
import { env } from './config/env.js';
import { db } from './db/index.js';
import { authRoutes } from './routes/auth.routes.js';
import { logRoutes } from './routes/log.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server, no Origin header).
      if (!origin || env.CLIENT_URL.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

// Tag every request with an id so a log line can be correlated with a
// specific request when debugging a user-reported issue in production.
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});
morgan.token('id', (req) => req.id);
app.use(morgan(':id :method :url :status :response-time ms'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/health', async (req, res) => {
  try {
    await db.execute('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(`[${req.id}] Health check DB probe failed:`, err);
    res.status(503).json({ status: 'unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api', logRoutes);

app.use(errorHandler);
