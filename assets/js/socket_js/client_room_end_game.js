import io from 'socket.io-client';
import sio from './_client_init.js';

import { clientEventGetRoomData } from './client_join_create_room.js';
import { ROOM_USER_COUNT_TO_START_GAME, GAME_STATE } from './_constants.js';



// -----------------------------
// Debug Logging Utility
// -----------------------------
const DEBUG_LOG = true; // Set to false to disable logs

function log(...args) {
    if (DEBUG_LOG) console.log(...args);
}



// -----------------------------
// Socket Communication Functions
// -----------------------------
function clientEventEndGame(roomcode) {
    // Emit event to server with result (callback_function)
    return new Promise((resolve, reject) => {
        if (!sio.connected) return reject(new Error('Socket not connected'));
        sio.emit('client_event_end_game', { roomcode }, (response) => {
            log('📤 Sent client_event_end_game, server responded with:', response);
            resolve(response);
        });
    });
}

function clientEventEndGameCleanup(roomcode){
      // Emit event to server with result (callback_function)
    return new Promise((resolve, reject) => {
        if (!sio.connected) return reject(new Error('Socket not connected'));
        sio.emit('client_event_end_game_cleanup', { roomcode }, (response) => {
            log('📤 Sent client_event_end_game_cleanup, server responded with:', response);
            resolve(response);
        });
    });  
}




// -----------------------------
// Event Listeners
// -----------------------------
const hostControlsContainer = document.getElementById("hostControlsContainer");
if (hostControlsContainer) {
    hostControlsContainer.addEventListener("click", async (e) => {
        // Check if the clicked element is the end game button (or inside it)
        const endGameBtn = e.target.closest("#endGameBtn");
        if (endGameBtn) {
            const username = document.getElementById("username").value;
            const roomcode = document.getElementById("roomcode").value;
            log("===== End Game button clicked by:", username, "in room:", roomcode);

            // ----- Clear previous error messages -----
            document.getElementById("endGameBtn_error").innerText = "";

            try {
                // ----- Send AJAX request to server -----
                const response = await clientEventEndGame(roomcode);
                if (response.success) {
                    log("Game ended successfully.");
                    // Optionally, perform cleanup
                    const cleanupResponse = await clientEventEndGameCleanup(roomcode);
                    if (cleanupResponse.success) {
                        log("Game cleanup successful.");
                    }
                } else {
                    log("Failed to end game:", response.error);
                    document.getElementById("endGameBtn_error").innerText = response.error || "Failed to end game.";
                }
            } catch (error) {
                console.error("Error ending game:", error);
        
            }
        }
    });
} else {
    log("hostControlsContainer not found.");
}









// // Mapping out Game Flow:

// - Host Clicks "End Game" button

//     - Backend Logic:
//         - Update Room State to "FINISHED"
//         - Show Results Screen to all users
//         - Clean up Game Data
//         - Take users back to Lobby

//     - UI Updates:
//         - User View (Generic.. roomInfoContainer)
//         - Host View (Specific.. hostControlsContainer)
