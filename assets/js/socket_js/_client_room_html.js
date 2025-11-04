import { ROOM_USER_COUNT_TO_START_GAME, 
        ROOM_USER_MAX_COUNT, 
        DISABLED_BTN_OPACITY } from './_constants.js';

/**
 * @param {Object} data - {
 *   host_username: string,
 *   room_users: Array<{ sid: string, username: string }>
 * }
 */



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
// UI Update - Room Info
// -----------------------------
export function updateRoomInfoContainerHTML(data) {
    const username_doc_id = document.getElementById("username").value;
    const roomcode_doc_id = document.getElementById("roomcode").value;
    const room_user_count = data.room_users.length;
    const usernames = data.room_users.map(user => user.username);
    const roomInfoContainer = document.getElementById("roomInfoContainer");

    // Clear previous content
    roomInfoContainer.innerHTML = "";

    // User Header
    const userHeader = document.createElement("h5");
    userHeader.textContent = `Players (${room_user_count}/${ROOM_USER_MAX_COUNT}):`;
    userHeader.classList.add("fw-bold", "fs-6", "mb-3");

    // User list
    const userListContainer = document.createElement("div");
    userListContainer.id = "userListContainer";
    userListContainer.classList.add("d-flex", "flex-column", "gap-2");

    
    usernames.forEach(username => {
        const usernameContainer = document.createElement("div");
        usernameContainer.classList.add("bg-tertiary", "d-flex", "align-items-center", "justify-between", "p-2", "rounded");
        
        const usernameDiv = document.createElement("div");
        usernameDiv.textContent = username;
        usernameContainer.appendChild(usernameDiv);
        
        // Badges container (right aligned)
        const badgesContainer = document.createElement("div");
        badgesContainer.classList.add("ms-auto", "d-flex", "align-items-center", "gap-1");
        usernameContainer.appendChild(badgesContainer);

        // If username == host, add host text
        if (username === data.host_username) {
            const hostBadge = document.createElement("div");
            hostBadge.textContent = "☆ Host";
            hostBadge.classList.add("fs-8");
            badgesContainer.appendChild(hostBadge);
        }
        
        // if username == current user, add (You)
        if (username === username_doc_id) {
            const usernameYouBadge = document.createElement("div");
            usernameYouBadge.textContent = "(You)";
            usernameYouBadge.classList.add("fs-8");
            badgesContainer.appendChild(usernameYouBadge);
        }

        userListContainer.appendChild(usernameContainer);
    });
    

    roomInfoContainer.prepend(userHeader);
    roomInfoContainer.appendChild(userListContainer);





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


// -----------------------------
// UI Update - Shout Message
// -----------------------------
export function updateShoutMsgList(msg) {
    const shoutMsgList = document.getElementById("shoutMsgList");
    
    // Append new message with newline if not empty
    if (shoutMsgList.innerText.trim().length > 0) {
        shoutMsgList.innerText += `\n${msg}`;
    } else {
        shoutMsgList.innerText = msg;
    }

    // Auto-scroll to bottom
    shoutMsgList.scrollTop = shoutMsgList.scrollHeight;
}

