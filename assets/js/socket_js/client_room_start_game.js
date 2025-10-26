import io from 'socket.io-client';
import sio from './client_init.js';



// -----------------------------
// Debug Logging Utility
// -----------------------------
const DEBUG_LOG = true; // Set to false to disable logs

function log(...args) {
    if (DEBUG_LOG) console.log(...args);
}




const hostControlsContainer = document.getElementById("hostControlsContainer");
if (hostControlsContainer) {
    hostControlsContainer.addEventListener("click", async (e) => {
        // Check if the clicked element is the start game button (or inside it)
        const startGameBtn = e.target.closest("#startGameBtn");
        if (startGameBtn) {
            const username = document.getElementById("username").value;
            const roomcode = document.getElementById("roomcode").value;
            log("===== Start Game button clicked by:", username, "in room:", roomcode);

            // Your start game logic here
        }
    });
} else {
    log("hostControlsContainer not found.");
}

//else start game button not found





// // -----------------------------
// // UI Update Functions
// // -----------------------------
// function updateShoutMsgList(msg) {
//     const shoutMsgList = document.getElementById("shoutMsgList");
    
//     // Append new message with newline if not empty
//     if (shoutMsgList.innerText.trim().length > 0) {
//         shoutMsgList.innerText += `\n${msg}`;
//     } else {
//         shoutMsgList.innerText = msg;
//     }

//     // Auto-scroll to bottom
//     shoutMsgList.scrollTop = shoutMsgList.scrollHeight;
// }



// function clientEventShoutMsg(username, roomcode) {
//     // Emit event to server with result (callback_function)
//     return new Promise((resolve, reject) => {
//         if (!sio.connected) return reject(new Error('Socket not connected'));
//         sio.emit('client_event_shout_msg', { username, roomcode }, (response) => {
//             log('📤 Sent client_event_shout_msg, server responded with:', response);
//             resolve(response);
//         });
//     });
// }


// // -----------------------------
// // Socket Event Listeners
// // -----------------------------

// // Listen for server broadcast updates
// sio.on("server_event_shout_msg", (data) => {
//     log("📡 server_event_shout_msg update received:", data);
//     updateShoutMsgList(data.shout_message);
// });






// // -----------------------------
// // Socket Event Listeners
// // -----------------------------

// // Listen for server broadcast updates
// sio.on("server_event_room_update", (data) => {
//     log("📡 Room update received:", data);
//     updateRoomInfo(data);
// });
