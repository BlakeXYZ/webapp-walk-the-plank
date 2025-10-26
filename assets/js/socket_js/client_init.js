import io from 'socket.io-client';

// -----------------------------
// Socket.IO Setup
// -----------------------------

const sio = io({
    transports: ['polling', 'websocket'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
    forceNew: true,  // Force new connection
    autoConnect: false,
});

export default sio;