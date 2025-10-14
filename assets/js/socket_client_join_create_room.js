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


document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent default page reload

    // Clear previous error messages
    document.getElementById("username_error").innerText = "";
    document.getElementById("roomcode_error").innerText = "";

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    const submitType = document.activeElement.id;
    payload.submitType = submitType;


    //TODO: Query SocketIO Dictionary of Active Rooms
    // const activeRooms = await sio.emit('get_active_rooms', (rooms) => {
    //     console.log('Active Rooms:', rooms);
    //     return rooms;
    // });

    
    try {
        // Ensure socket connection is established
        await waitForSocketConnection();
        console.log("Socket connected with SID:", sio.id);

        // Once connected, Get Active Rooms
        const activeRooms = await clientEventGetActiveRooms();
        payload.activeRooms = activeRooms;
        console.log("Active Rooms from server:", activeRooms);

        console.log("Payload to send:", payload);


        const response = await fetch('/ajax/test_ajax', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log("Server Response:", result);

        if (result.success) {
            document.getElementById("server_response_div").innerText = "Server Response: Success!";
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