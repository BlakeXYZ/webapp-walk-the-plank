import io from 'socket.io-client';

export const ROOM_USER_COUNT_TO_START_GAME = 3;
export const DISABLED_BTN_OPACITY = 0.5;

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