import { ROOM_USER_COUNT_TO_START_GAME, 
        ROOM_USER_MAX_COUNT, 
        DISABLED_BTN_OPACITY,
        GAME_STATE } from './_constants.js';

/**
 * @param {Object} data - {
 *   host_username: string,
 *   room_users: Array<{ sid: string, username: string }>
 * }
 */




// -----------------------------
// UI Update - Room Info
// -----------------------------

export function updateRoomUI(data) {
    const gameState = data.game_state 
    const roomInfoContainer = document.getElementById("roomInfoContainer");
    const hostControlsContainer = document.getElementById("hostControlsContainer");

    // Clear previous content
    roomInfoContainer.innerHTML = "";
    hostControlsContainer.innerHTML = "";

    // Render based on game state
    switch (gameState) {
        case GAME_STATE.LOBBY:
            render_LobbyState_UI(data);
            break;
        case GAME_STATE.IN_PROGRESS:
            render_InProgressState_UI(data);
            break;
    }
}


// TODO: Better organize these UI functions
// TODO: Better placement for IF host logic and IF imposter logic.
//       Need to make code as clear as possible for calling unique cases per user and their game_state + game_data + if host.
//       reference: my_flask_app\data\constants.py
//       GAME_DATA = "game_data" # (roles, timer settings, game mode, etc.)
// -----------------------------
// UI - Game In Progress State 
// -----------------------------

function render_InProgressState_UI(data) {

    roomInfo_inProgress_HTML(data);

    // if host:
    if (data.host_username === document.getElementById("username").value) {
        hostControls_inProgress_HTML(data);
    }   
}

// -----------------------------
// UI - Lobby State
// -----------------------------

function render_LobbyState_UI(data) {
    roomInfo_lobby_HTML(data);

    // if host:
    if (data.host_username === document.getElementById("username").value) {
        hostControls_lobby_HTML(data);
    }
}




// -----------------------------
// Room Info Container HTML 
// -----------------------------

function roomInfo_lobby_HTML(data) {
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

function roomInfo_inProgress_HTML(data) {
    const username_doc_id = document.getElementById("username").value;
    const roomcode_doc_id = document.getElementById("roomcode").value;
    const room_user_count = data.room_users.length;
    const usernames = data.room_users.map(user => user.username);
    const roomInfoContainer = document.getElementById("roomInfoContainer");

    // Clear previous content
    roomInfoContainer.innerHTML = "";

    // Game State Header
    const gameStateHeader = document.createElement("h5");
    gameStateHeader.textContent = `Game State: ${data.game_state.replace('_', ' ').toUpperCase()}`;
    gameStateHeader.classList.add("fw-bold", "fs-6", "mb-3");


    // User Role Assignment
    const roleAssignmentDiv = document.createElement("div");
    const currentUser = data.room_users.find(user => user.username === username_doc_id);
    roleAssignmentDiv.textContent = `Your Role: ${currentUser ? currentUser.role.toUpperCase() : 'N/A'}`;
    roleAssignmentDiv.classList.add("mb-3", "fs-5", "fw-semibold");

    // Mode Details
    const gameModeDiv = document.createElement("div");
    gameModeDiv.textContent = `Game Mode: ${data.game_data.game_mode.replace('_', ' ').toUpperCase()}`;
    gameModeDiv.classList.add("mb-2", "fs-6");

    const instructionsDiv = document.createElement("div");
    instructionsDiv.textContent = `Instructions: ${data.game_data.mode_details.instructions}`;
    instructionsDiv.classList.add("mb-2", "fs-6");

    const categoryDiv = document.createElement("div");
    categoryDiv.textContent = `Category: ${data.game_data.mode_details.category}`;
    categoryDiv.classList.add("mb-2", "fs-6");

    const passwordDiv = document.createElement("div");
    // TODO: find alternative to hardpathing string "IMPOSTOR"
    if (roleAssignmentDiv.textContent.includes("IMPOSTOR")) {
        passwordDiv.textContent = `Password: ********`;
    } else {
        passwordDiv.textContent = `Password: ${data.game_data.mode_details.password}`;
    }
    passwordDiv.classList.add("mb-2", "fs-6");

    
    // Append to container
    roomInfoContainer.appendChild(gameStateHeader);
    gameStateHeader.appendChild(roleAssignmentDiv);
    roomInfoContainer.appendChild(gameModeDiv);
    roomInfoContainer.appendChild(instructionsDiv);
    roomInfoContainer.appendChild(categoryDiv);
    roomInfoContainer.appendChild(passwordDiv);
}

// -----------------------------
// Host Controls Container HTML
// ----------------------------
export function hostControls_lobby_HTML(data) {
    const hostControlsContainer = document.getElementById("hostControlsContainer");
    hostControlsContainer.innerHTML = `
        <h5 class="mt-3">Host Controls:</h5>
        <button type="button" id="startGameBtn" class="btn btn-primary mt-2">Start Game</button>
        <small class="text-danger" id="startGameBtn_error"></small>
    `;

    updateStartGameOpacityHTML(data);
}


export function hostControls_inProgress_HTML(data) {
    const hostControlsContainer = document.getElementById("hostControlsContainer");
    hostControlsContainer.innerHTML = `
        <h5 class="mt-3">Host Controls:</h5>
        <button type="button" id="endGameBtn" class="btn btn-secondary mt-2">End Game</button>
        <small class="text-danger" id="endGameBtn_error"></small>
    `;
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

