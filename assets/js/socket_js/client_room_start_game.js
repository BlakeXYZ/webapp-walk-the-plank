import io from 'socket.io-client';
import sio from './_client_init.js';

import { clientEventGetRoomData } from './client_join_create_room.js';
import { ROOM_USER_COUNT_TO_START_GAME } from './_client_init.js';



// -----------------------------
// Debug Logging Utility
// -----------------------------
const DEBUG_LOG = true; // Set to false to disable logs

function log(...args) {
    if (DEBUG_LOG) console.log(...args);
}


// Now you can use it:
const hostControlsContainer = document.getElementById("hostControlsContainer");
if (hostControlsContainer) {
    hostControlsContainer.addEventListener("click", async (e) => {
        // Check if the clicked element is the start game button (or inside it)
        const startGameBtn = e.target.closest("#startGameBtn");
        if (startGameBtn) {
            const username = document.getElementById("username").value;
            const roomcode = document.getElementById("roomcode").value;
            log("===== Start Game button clicked by:", username, "in room:", roomcode);

            // ----- Clear previous error messages -----
            document.getElementById("startGameBtn_error").innerText = "";

            // ----- Get active room data -----
            const activeRoomData = await clientEventGetRoomData(roomcode);

            // ----- Prepare payload -----
            const payload = activeRoomData;
            payload.room_user_count_to_start_game = ROOM_USER_COUNT_TO_START_GAME;

            try {
                // ----- Send AJAX request to server -----
                const response = await fetch('/ajax/onClick_start_game', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (result.success) {
                    // window.location.href = "/room/";
                } else {
                    if (result.errors) {
                        document.getElementById("startGameBtn_error").innerText = result.errors.join(", ");
                    }
                }

            } catch (error) {
                console.error("Error sending payload:", error);
        
            }
        }
    });
} else {
    log("hostControlsContainer not found.");
}






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
