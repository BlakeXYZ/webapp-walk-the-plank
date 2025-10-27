import io from 'socket.io-client';
import sio from './_client_init.js';

import { DISABLED_BTN_OPACITY } from './_constants.js';
import { initRoomHostViewHTML, updateRoomInfoContainerHTML, updateStartGameOpacityHTML } from './_client_room_html.js';

// -----------------------------
// Debug Logging Utility
// -----------------------------
const DEBUG_LOG = true; // Set to false to disable logs

function log(...args) {
    if (DEBUG_LOG) console.log(...args);
}





sio.on('connect', () => {
    log('✅ Connected to server, SID:', sio.id);
});


// -----------------------------
// Utility Functions
// -----------------------------
function waitForSocketConnection() {
    return new Promise((resolve) => {
        if (sio.connected) resolve();
        sio.on('connect', resolve);
        sio.connect();
    });
}


// -----------------------------
// Socket Communication Functions
// -----------------------------
export function clientEventGetActiveRooms() {
    // Emit event to server with result (callback_function)
    return new Promise((resolve, reject) => {
        if (!sio.connected) return reject(new Error('Socket not connected'));
        sio.emit('client_event_get_active_rooms', {}, (rooms) => {
            log('📤 Sent client_event_get_active_rooms, server responded with:', rooms);
            resolve(rooms);
        });
    });
}

export function clientEventGetRoomData(roomcode) {
    // Emit event to server with result (callback_function)
    return new Promise((resolve, reject) => {
        if (!sio.connected) return reject(new Error('Socket not connected'));
        sio.emit('client_event_get_room_data', { roomcode }, (roomData) => {
            log('📤 Sent client_event_get_room_data, server responded with:', roomData);
            resolve(roomData);
        });
    });
}

function clientEventJoinRoom(username, roomcode) {
    // Emit event to server with result (callback_function)
    return new Promise((resolve, reject) => {
        if (!sio.connected) return reject(new Error('Socket not connected'));
        sio.emit('client_event_join_room', { username, roomcode }, (response) => {
            log('📤 Sent client_event_join_room, server responded with:', response);
            resolve(response);
        });
    });

    
}


// -----------------------------
// Socket Event Listeners
// -----------------------------

// Listen for server broadcast updates
sio.on("server_event_room_update", (data) => {
    log("📡 Room update received:", data);
    updateRoomInfoContainerHTML(data);
    updateStartGameOpacityHTML(data);
});


// -----------------------------
// Room Page Logic
// -----------------------------
if (window.location.pathname === "/room/") {
    document.addEventListener("DOMContentLoaded", async () => {
        await waitForSocketConnection();

        const username = document.getElementById("username").value;
        const roomcode = document.getElementById("roomcode").value;

        log("========Attempting to join room with username:", username, "and roomcode:", roomcode);
        
        
        const response = await clientEventJoinRoom(username, roomcode);
        if (username == response.data.host_username) {
            initRoomHostViewHTML(response.data);
            updateStartGameOpacityHTML(response.data);
        }

    });
}

// -----------------------------
// Join + Create Room Button Opacity enable/disable Logic
// -----------------------------

const usernameInput = document.getElementById("username");
const roomcodeInput = document.getElementById("roomcode");
const joinRoomButton = document.getElementById("join_room");
const createRoomButton = document.getElementById("create_room");

function updateButtonStates() {
    const username = usernameInput.value.trim();
    const roomcode = roomcodeInput.value.trim();
    const btnEnabled_opacity = "1";
    const btnDisabled_opacity = DISABLED_BTN_OPACITY;

    // Enable/disable Join Room button
    joinRoomButton.style.opacity = (username.length > 0 && roomcode.length > 0) ? btnEnabled_opacity : btnDisabled_opacity;

    // Enable/disable Create Room button
    createRoomButton.style.opacity = (username.length > 0) ? btnEnabled_opacity : btnDisabled_opacity;
}

if (joinRoomButton && createRoomButton) {

    document.addEventListener("DOMContentLoaded", (updateButtonStates));
    usernameInput.addEventListener("input", (updateButtonStates));
    roomcodeInput.addEventListener("input", (updateButtonStates));

}

// -----------------------------
// Register Form Logic
// -----------------------------

const registerForm = document.getElementById("registerForm");
if (registerForm) {

    let lastClickedSubmitType = null;

    document.querySelectorAll("#registerForm input[type='submit']").forEach(btn => {
        btn.addEventListener("click", (e) => {
            lastClickedSubmitType = e.target.id; // "join_room" or "create_room"
        });
    });


    document.getElementById("registerForm").addEventListener("submit", async (e) => {
        e.preventDefault(); // prevent default page reload

        // ----- Clear previous error messages -----
        document.getElementById("username_error").innerText = "";
        document.getElementById("roomcode_error").innerText = "";
        document.getElementById("submitType_error").innerHTML = "";

        // ----- Gather form data -----
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());
        payload.submitType = lastClickedSubmitType; 

        try {
            // ----- Ensure socket connection is established -----
            await waitForSocketConnection();
            log("Socket connected with SID:", sio.id);

            // ----- Once connected, Get Active Rooms -----
            const activeRooms = await clientEventGetActiveRooms();
            payload.activeRooms = activeRooms;

            // ----- Send AJAX request to server -----
            const response = await fetch('/ajax/onClick_create_or_join_room', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            log("Server Response:", result);

            if (result.success) {
                window.location.href = "/room/";
            } else {
                if (result.errors.username) {
                    document.getElementById("username_error").innerText = result.errors.username.join(", ");
                }
                if (result.errors.roomcode) {
                    document.getElementById("roomcode_error").innerText = result.errors.roomcode.join(", ");
                }
                if (result.errors.submitType) {
                    document.getElementById("submitType_error").innerHTML = result.errors.submitType.join(", ");
                }
            }
        } catch (error) {
            console.error("Error sending payload:", error);
        }
    });
}


// -----------------------------
// Handle Mobile page back + forward issue. Force reload on bfcache restore to ensure fresh state.
// -----------------------------
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});