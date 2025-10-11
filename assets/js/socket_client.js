import io from 'socket.io-client';


const sio = io({
    transports: ['websocket'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
    forceNew: true,  // Force new connection
    autoConnect: true
    
});

sio.on('connect', () => {
    console.log('✅ Connected to server, SID:', sio.id);
    
    // Emit event to server with result (callback_function)
    sio.emit('client_event_sum', {nums: [3, 10]}, (result) => {
        console.log('📤 Sent client_event_sum, server responded with:', result);
    });
});

sio.on('disconnect', () => {
    console.log('❌ Disconnected from server.');
});

// Handle event from server and respond via cb (callback)
sio.on('server_event_multiply', (data, cb) => {
    console.log('📬 Client received server_event_multiply:', data);
    const result = data.nums[0] * data.nums[1];
    console.log('🔧 Computed multiply: ', result);
    cb({result: result});
});


















// document.addEventListener('DOMContentLoaded', function() {
//     console.log('🏴‍☠️ Initializing Socket.IO...');
    
//     // Prevent multiple connections
//     if (window.socket) {
//         console.log('🔄 Socket already exists, disconnecting old one...');
//         window.socket.disconnect();
//         window.socket = null;
//     }
    
//     function initializeSocketIO() {
//         if (typeof io === 'undefined') {
//             console.log('⏳ Waiting for Socket.IO...');
//             setTimeout(initializeSocketIO, 100);
//             return;
//         }
        
//         console.log('✅ Socket.IO library loaded, connecting...');
        
//         const sio = io({
//             transports: ['websocket'],
//             timeout: 10000,
//             reconnection: true,
//             reconnectionAttempts: 3,
//             reconnectionDelay: 2000,
//             forceNew: true,  // Force new connection
//             autoConnect: true
            
//         });

//         sio.on('connect', () => {
//             console.log('✅ Connected to server, SID:', sio.id);
//         });

//         sio.on('welcome', (data) => {
//             console.log('🏴‍☠️ SERVER WELCOME:', data.message);
//             console.log('🆔 Server says your SID is:', data.sid);
//             console.log('🆔 Client thinks SID is:', sio.id);
//         });

//         sio.on('response', (data) => {
//             console.log('📬 Server response:', data.message);
//         });

//         sio.on('disconnect', (reason) => {
//             console.log('❌ Disconnected from server. Reason:', reason);
            
//             // Only show error if it's not a normal disconnect
//             if (reason !== 'io client disconnect' && reason !== 'transport close') {
//                 console.error('🚫 Unexpected disconnect:', reason);
//             }
//         });

//         sio.on('connect_error', (error) => {
//             console.error('🚫 Connection error:', error);
//         });
        
//         // Store globally
//         window.socket = sio;
        
//         // Test function
//         window.testMessage = (msg) => {
//             if (sio.connected) {
//                 console.log('📤 Sending test message...');
//                 sio.emit('test_message', msg || 'Hello from the browser!');
//             } else {
//                 console.log('⚠️ Socket not connected');
//             }
//         };

//         window.testMessage_B = (msg) => {
//             if (sio.connected) {
//                 console.log('📤 Sending test message B...');
//                 sio.emit('test_message_b', msg || 'Hello from the browser, test B!');
//             } else {
//                 console.log('⚠️ Socket not connected');
//             }
//         };

//         sio.on('responseB', (data) => {
//                     console.log(`📬 !!!! Server B response:\n---- ${data.message} \n---- SID: ${data.sid}`);
//                 });



//     }
    
//     initializeSocketIO();
// });