import { io } from 'socket.io-client';

let socket = null;
let currentToken = null;

function getSocketBaseUrl() {
  const fromEnv = process.env.REACT_APP_SOCKET_URL;
  if (fromEnv) return fromEnv;

  const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';
  try {
    const parsed = new URL(apiBase);
    return parsed.origin;
  } catch {
    return 'http://localhost:5000';
  }
}

export function connectSocket(token) {
  if (!token) return null;

  if (socket && currentToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  currentToken = token;
  socket = io(getSocketBaseUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
}
