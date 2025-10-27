import io from 'socket.io-client';
import sio from './_client_init.js';

import { updateShoutMsgList } from './_client_room_html.js';



// -----------------------------
// Debug Logging Utility
// -----------------------------
const DEBUG_LOG = true; // Set to false to disable logs

function log(...args) {
    if (DEBUG_LOG) console.log(...args);
}


const shoutMsgBtn = document.getElementById('shoutMsgBtn');


if (shoutMsgBtn) {
    shoutMsgBtn.addEventListener('click', async () => {
        const username = document.getElementById("username").value;
        const roomcode = document.getElementById("roomcode").value;

        await clientEventShoutMsg(username, roomcode);

    });
}


function clientEventShoutMsg(username, roomcode) {
    // Emit event to server with result (callback_function)
    return new Promise((resolve, reject) => {
        if (!sio.connected) return reject(new Error('Socket not connected'));
        sio.emit('client_event_shout_msg', { username, roomcode }, (response) => {
            log('📤 Sent client_event_shout_msg, server responded with:', response);
            resolve(response);
        });
    });
}


// -----------------------------
// Socket Event Listeners
// -----------------------------

// Listen for server broadcast updates
sio.on("server_event_shout_msg", (data) => {
    log("📡 server_event_shout_msg update received:", data);
    updateShoutMsgList(data.shout_message);
});






// // -----------------------------
// // Socket Event Listeners
// // -----------------------------

// // Listen for server broadcast updates
// sio.on("server_event_room_update", (data) => {
//     log("📡 Room update received:", data);
//     updateRoomInfo(data);
// });
