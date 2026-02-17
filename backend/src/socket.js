const { Server } = require('socket.io');
const env = require('./config/env');
const { verifyToken } = require('./utils/jwt');

let io;

function getAllowedOrigins() {
  return env.clientOrigin
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const authToken = socket.handshake.auth?.token;
      const headerToken = socket.handshake.headers?.authorization?.replace('Bearer ', '');
      const token = authToken || headerToken;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyToken(token);
      socket.user = { id: payload.userId, role: payload.role };
      return next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const room = `user:${socket.user.id}`;
    socket.join(room);

    socket.on('disconnect', () => {
      socket.leave(room);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
};
