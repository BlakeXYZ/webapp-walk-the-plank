// App initialization code goes here

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏴‍☠️ Initializing Socket.IO...');
    
    // Prevent multiple connections
    if (window.socket) {
        console.log('🔄 Socket already exists, disconnecting old one...');
        window.socket.disconnect();
        window.socket = null;
    }
    
    function initializeSocketIO() {
        if (typeof io === 'undefined') {
            console.log('⏳ Waiting for Socket.IO...');
            setTimeout(initializeSocketIO, 100);
            return;
        }
        
        console.log('✅ Socket.IO library loaded, connecting...');
        
        const sio = io({
            transports: ['polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            forceNew: true,  // Force new connection
            autoConnect: true
            
        });

        sio.on('connect', () => {
            console.log('✅ Connected to server, SID:', sio.id);
        });

        sio.on('welcome', (data) => {
            console.log('🏴‍☠️ SERVER WELCOME:', data.message);
            console.log('🆔 Server says your SID is:', data.sid);
            console.log('🆔 Client thinks SID is:', sio.id);
        });

        sio.on('response', (data) => {
            console.log('📬 Server response:', data.message);
        });

        sio.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server. Reason:', reason);
            
            // Only show error if it's not a normal disconnect
            if (reason !== 'io client disconnect' && reason !== 'transport close') {
                console.error('🚫 Unexpected disconnect:', reason);
            }
        });

        sio.on('connect_error', (error) => {
            console.error('🚫 Connection error:', error);
        });
        
        // Store globally
        window.socket = sio;
        
        // Test function
        window.testMessage = (msg) => {
            if (sio.connected) {
                console.log('📤 Sending test message...');
                sio.emit('test_message', msg || 'Hello from the browser!');
            } else {
                console.log('⚠️ Socket not connected');
            }
        };
    }
    
    initializeSocketIO();
});