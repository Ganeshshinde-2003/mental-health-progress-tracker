import { createServer } from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { db, runMigrations } from './db/index.js';
import { initSockets } from './sockets/index.js';

const httpServer = createServer(app);
const io = initSockets(httpServer, env.CLIENT_URL);

await runMigrations();

httpServer.listen(env.PORT, () => {
  console.log(`Server listening on port ${env.PORT}`);
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully...`);

  io.close();

  httpServer.close((err) => {
    if (err) {
      console.error('Error closing HTTP server:', err);
      process.exitCode = 1;
    }
  });

  try {
    db.close();
  } catch (err) {
    console.error('Error closing DB connection:', err);
  }

  // Force-exit if something keeps the event loop alive past a reasonable grace period.
  setTimeout(() => process.exit(process.exitCode ?? 0), 5000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
