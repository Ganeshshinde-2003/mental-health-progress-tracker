import { Server } from 'socket.io';
import { firebaseAuth } from '../config/firebase.js';

let io;

// Exported separately so the handshake auth logic can be unit tested without
// spinning up a real Socket.io server.
export async function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) throw new Error('missing token');
    const decoded = await firebaseAuth.verifyIdToken(token);
    socket.data.firebaseUid = decoded.uid;
    next();
  } catch (_err) {
    next(new Error('unauthorized'));
  }
}

export function initSockets(httpServer, clientUrl) {
  io = new Server(httpServer, {
    cors: { origin: clientUrl, credentials: true },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    socket.join(socket.data.firebaseUid);
  });

  return io;
}

export function emitNewLog(firebaseUid, log) {
  if (!io) return;
  io.to(firebaseUid).emit('newLog', log);
}
