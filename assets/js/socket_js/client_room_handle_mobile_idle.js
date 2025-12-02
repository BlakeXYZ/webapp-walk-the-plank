import io from 'socket.io-client';
import sio from './_client_init.js';

import { clientEventGetRoomData } from './client_join_create_room.js';


// -----------------------------
// Debug Logging Utility
// -----------------------------
const DEBUG_LOG = true; // Set to false to disable logs

function log(...args) {
    if (DEBUG_LOG) console.log(...args);
}


// Add mobile wake detection
let lastActiveTime = Date.now();
let wasHidden = false;
let checkInterval = null;

// Update activity timestamp on any user interaction
function updateActivity() {
    lastActiveTime = Date.now();
    log('🕒 Activity updated');
}

// Listen for user activity
document.addEventListener('click', updateActivity);
document.addEventListener('keydown', updateActivity);
document.addEventListener('scroll', updateActivity);
document.addEventListener('touchstart', updateActivity);

// Check for mobile wake-up scenario
function checkForWakeUp() {
    const now = Date.now();
    const timeSinceActivity = now - lastActiveTime;
    
    // If more than 2 minutes since last activity and we're visible, probably woke up
    if (timeSinceActivity > 120000 && !document.hidden && wasHidden) {
        log('📱 Detected mobile wake-up, checking connection...');
        handleWakeUp();
    }
}

// Handle wake-up scenarios
async function handleWakeUp() {
    const roomcode = document.getElementById("roomcode")?.value;
    const username = document.getElementById("username")?.value;
    
    if (!roomcode || !username) return;
    
    log('🔄 Handling wake-up scenario');
    
    // Check if socket is still connected
    if (!sio.connected) {
        log('🔌 Socket disconnected, attempting reconnection...');
        
        // Wait for reconnection
        try {
            await waitForSocketConnection(10000);
            await rejoinRoomAfterWakeUp(username, roomcode);
        } catch (error) {
            console.error('❌ Failed to reconnect:', error);

        }
    } else {
        // Socket appears connected, but verify by getting room data
        try {
            const roomData = await clientEventGetRoomData(roomcode);
            
            // Check if we're still in the room
            const userInRoom = roomData.room_users?.some(user => user.username === username);
            
            if (!userInRoom) {
                log('🔄 Not in room anymore, rejoining...');
                await rejoinRoomAfterWakeUp(username, roomcode);
            } else {
                log('✅ Still in room, connection verified');
            }
        } catch (error) {
            log('⚠️ Room verification failed, rejoining...');
            await rejoinRoomAfterWakeUp(username, roomcode);
        }
    }
}

// Rejoin room after wake-up
async function rejoinRoomAfterWakeUp(username, roomcode) {
    try {
        const response = await clientEventJoinRoom(username, roomcode);
        log('✅ Successfully rejoined room:', response);
    } catch (error) {
        console.error('❌ Failed to rejoin room:', error);
    }
}

// Page visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        log('📱 App went to background');
        wasHidden = true;
        
        // Stop checking while hidden
        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
        }
    } else {
        log('📱 App came to foreground');
        
        if (wasHidden) {
            // Start checking for wake-up scenarios
            checkInterval = setInterval(checkForWakeUp, 2000); // Check every 2 seconds
            
            // Immediate check
            setTimeout(handleWakeUp, 500); // Small delay to let UI settle
        }
        
        wasHidden = false;
        updateActivity(); // Reset activity timer
    }
});

// Focus event as backup
window.addEventListener('focus', () => {
    if (wasHidden) {
        log('📱 Window focused after being hidden');
        setTimeout(handleWakeUp, 500);
    }
});