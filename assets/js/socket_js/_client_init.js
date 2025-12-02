import io from 'socket.io-client';

// -----------------------------
// Socket.IO Setup
// -----------------------------

const sio = io({
    transports: ['polling', 'websocket'],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    forceNew: false,  
});

export default sio;