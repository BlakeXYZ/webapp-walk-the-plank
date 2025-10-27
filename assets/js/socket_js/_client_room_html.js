import { ROOM_USER_COUNT_TO_START_GAME, DISABLED_BTN_OPACITY } from './_client_init.js';

// -----------------------------
// UI Init Functions
// ----------------------------


export function initRoomHostViewHTML() {
    const hostControlsContainer = document.getElementById("hostControlsContainer");
    hostControlsContainer.innerHTML = `
        <h5 class="mt-3">Host Controls:</h5>
        <button type="button" id="startGameBtn" class="btn btn-primary mt-2">Start Game</button>
        <small class="text-danger" id="startGameBtn_error"></small>
    `;
}


// -----------------------------
// UI Update Functions
// -----------------------------
export function updateRoomInfoContainerHTML(data) {
    const room_user_count = data.room_users.length;
    const usernames = data.room_users.map(user => user.username);

    const roomInfoContainer = document.getElementById("roomInfoContainer");
    roomInfoContainer.innerHTML = ""; // Clear previous content

    // Host Info Div
    const hostInfoDiv = document.createElement("div");
    hostInfoDiv.id = "hostInfoDiv";
    hostInfoDiv.textContent = `Host: ${data.host_username}`;
    
    // User Count Div
    const roomInfoDiv = document.createElement("div");
    roomInfoDiv.textContent = `Player Count:\n${room_user_count}`;
    roomInfoDiv.id = "roomInfoDiv";

    // User list
    const usersDiv = document.createElement("div");
    usersDiv.textContent = "Players:\n";
    usersDiv.classList.add("mt-1", "mb-1");

    usernames.forEach(username => {
        const userSpan = document.createElement("span");
        userSpan.textContent = username;
        userSpan.classList.add("badge", "bg-secondary", "me-1");
        usersDiv.appendChild(userSpan);
    });
    
    
    roomInfoContainer.appendChild(hostInfoDiv);
    roomInfoContainer.appendChild(roomInfoDiv);
    roomInfoContainer.appendChild(usersDiv);


}


// -----------------------------
// Start Game Button Opacity enable/disable Logic
// -----------------------------


export function updateStartGameOpacityHTML(data) {
    const room_user_count = data.room_users.length;
    const startGameBtn = document.getElementById("startGameBtn");
    const btnEnabled_opacity = "1";
    const btnDisabled_opacity = DISABLED_BTN_OPACITY;

    if (startGameBtn) {
        startGameBtn.style.opacity = (room_user_count < ROOM_USER_COUNT_TO_START_GAME) ? btnDisabled_opacity : btnEnabled_opacity;
    }
}
