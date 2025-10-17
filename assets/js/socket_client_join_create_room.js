import io from 'socket.io-client';

// -----------------------------
// Debug Logging Utility
// -----------------------------
const DEBUG_LOG = true; // Set to false to disable logs

function log(...args) {
    if (DEBUG_LOG) console.log(...args);
}


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
function clientEventGetActiveRooms() {
    // Emit event to server with result (callback_function)
    return new Promise((resolve, reject) => {
        if (!sio.connected) return reject(new Error('Socket not connected'));
        sio.emit('client_event_get_active_rooms', {}, (rooms) => {
            log('📤 Sent client_event_get_active_rooms, server responded with:', rooms);
            resolve(rooms);
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
// UI Update Functions
// -----------------------------
function updateRoomInfo(data) {
    const roomInfo = document.getElementById("roomInfo");
    roomInfo.innerText = `User Count: ${data.room_user_count}`;
    roomInfo.innerText += `\n Users: ${data.room_username_list.join(", ")}`;
}


// -----------------------------
// Socket Event Listeners
// -----------------------------

// Listen for server broadcast updates
sio.on("server_event_room_update", (data) => {
    log("📡 Room update received:", data);
    updateRoomInfo(data);
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
        await clientEventJoinRoom(username, roomcode);

    });
}


// -----------------------------
// Register Form Logic
// -----------------------------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    document.getElementById("registerForm").addEventListener("submit", async (e) => {
        e.preventDefault(); // prevent default page reload

        // ----- Clear previous error messages -----
        document.getElementById("username_error").innerText = "";
        document.getElementById("roomcode_error").innerText = "";

        // ----- Gather form data -----
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData.entries());
        const submitType = document.activeElement.id;
        payload.submitType = submitType;

        try {
            // ----- Ensure socket connection is established -----
            await waitForSocketConnection();
            log("Socket connected with SID:", sio.id);

            // ----- Once connected, Get Active Rooms -----
            const activeRooms = await clientEventGetActiveRooms();
            payload.activeRooms = activeRooms;

            // ----- Send AJAX request to server -----
            const response = await fetch('/ajax/test_ajax', {
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
            }
        } catch (error) {
            console.error("Error sending payload:", error);
        }
    });
}