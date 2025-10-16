import io from 'socket.io-client';


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
    console.log('✅ Connected to server, SID:', sio.id);
});


sio.on('server_event_room_update', (data) => {

    console.log('📥 ====  ~~~~~~~~~  ===== Received server_event_room_update:', data);

    // const ul_room_user_names = document.getElementById('ul_room_user_names');
    const div_room_user_count = document.getElementById('div_room_user_count');

    // // Clear existing player names
    // ul_room_user_names = '';

    if (div_room_user_count && data.room_user_count) {
        div_room_user_count.textContent = `Users in room: ${data.room_user_count}`;
    }


});



// document.getElementById('button_emit_client_event').addEventListener('click', function(event) {
//     // Your code to handle the create room action goes here
//     console.log('Create Room button clicked');

//     if (!sio.connected) {
//         sio.connect();
//     }
//     // Emit event to server with result (callback_function)
//     sio.emit('client_event_sum', {nums: [3, 10]}, (result) => {
//         console.log('📤 Sent client_event_sum, server responded with:', result);
//     });
// });


// document.getElementById('button_emit_client_event').addEventListener('click', async function(event) {
//     console.log('button_emit_client_event clicked');

//     const csrf_token = document.getElementById('csrf_token').value;
//     const username = document.getElementById('username').value;
//     const roomcode = document.getElementById('roomcode').value;
//     const join_room = document.getElementById('join_room').value;
//     const create_room = document.getElementById('create_room').value;

//     const payload = { csrf_token, username, roomcode, join_room, create_room };
//     console.log('Payload to send:', payload);

//     try {
//         const response = await fetch('/ajax/test_ajax', {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json',},
//             body: JSON.stringify(payload),
//         });

//         const data = await response.json();
        
//         console.log('Success:', data);
//         document.getElementById('server_response_div').innerText = 'Server Response: ' + (data.success);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// });



function waitForSocketConnection() {
    return new Promise((resolve) => {
        if (sio.connected) resolve();
        sio.on('connect', resolve);
        sio.connect();
    });
}

function emitClientSumEvent() {
    // Emit event to server with result (callback_function)
    sio.emit('client_event_sum', {nums: [3, 10]}, (result) => {
        console.log('📤 Sent client_event_sum, server responded with:', result);
    });
}

function clientEventGetActiveRooms() {
    // Emit event to server with result (callback_function)
    return new Promise((resolve, reject) => {
        if (!sio.connected) return reject(new Error('Socket not connected'));
        sio.emit('client_event_get_active_rooms', {}, (rooms) => {
            console.log('📤 Sent client_event_get_active_rooms, server responded with:', rooms);
            resolve(rooms);
        });
    });
}

function clientEventJoinRoom(roomcode) {
    // Emit event to server with result (callback_function)
    return new Promise((resolve, reject) => {
        if (!sio.connected) return reject(new Error('Socket not connected'));
        sio.emit('client_event_join_room', { roomcode }, (response) => {
            console.log('📤 Sent client_event_join_room, server responded with:', response);
            if (response.error) {
                // Show warning message to user
                alert("You must join or create a room first.");
                // Redirect to home page
                window.location.href = "/";
                return reject(new Error(response.error));
            }            
            resolve(response);
        });
    });
}


document.addEventListener("DOMContentLoaded", async () => {

    // Only run on /room/ page
    if (window.location.pathname !== "/room/") return;
    const roomcode = document.getElementById("roomcode").value;
    console.log("Room code from DOM:", roomcode);

    // Wait for socket connection
    await waitForSocketConnection();
    // Immediately tell server "I'm in this room"
    await clientEventJoinRoom(roomcode);

    // Listen for room updates
    sio.on("server_event_room_update", (data) => {
        console.log("📩 Room update received:", data);
        const el = document.getElementById("room_user_count");
        if (el) el.innerText = `Users in Room: ${data.room_user_count}`;
    });
});


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
            console.log("Socket connected with SID:", sio.id);

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
            console.log("Server Response:", result);

            if (result.success) {
                // TODO: Redirect to game lobby or another page
                document.getElementById("server_response_div").innerText = "Server Response: Success!";


                // ----- Join the room via Socket.IO -----
                if (result.submitType === "join_room") {
                    window.location.href = `/room/`;
                    await clientEventJoinRoom(result.roomcode);
                    console.log(`Joined room ${result.roomcode} via Socket.IO`);
                }

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
