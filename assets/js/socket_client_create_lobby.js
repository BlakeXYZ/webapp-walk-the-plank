import io from 'socket.io-client';


const sio = io({
    transports: ['polling', 'websocket'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
    forceNew: true,  // Force new connection
    autoConnect: false,
    transportOptions: {   // Cannot send custom headers with WebSocket transport, SocketIO works by first connecting via HTTP polling, then upgrading to WebSocket
        polling: {
            extraHeaders: {
                'X-Username': 'hardcoded_username_example'  // Custom header for authentication
            }
        }
    }
});




sio.on('connect', () => {
    console.log('✅ Connected to server, SID:', sio.id);
});



document.getElementById('button_emit_client_event').addEventListener('click', function(event) {
    // Your code to handle the create room action goes here
    console.log('Create Room button clicked');

    if (!sio.connected) {
        sio.connect();
    }
    // Emit event to server with result (callback_function)
    sio.emit('client_event_sum', {nums: [3, 10]}, (result) => {
        console.log('📤 Sent client_event_sum, server responded with:', result);
    });
});