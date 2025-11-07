import logging
import random
logger = logging.getLogger(__name__)

from my_flask_app import user
import socketio
from . import sio

from my_flask_app.data.constants import RoomKeys, UserKeys, GameStates
from my_flask_app.data.game_data import pirate_shouts_LIST

client_count = 0
a_count = 0
b_count = 0

room_DICT = {} 

'''
Structure:
room_DICT = {
    "roomcode_ABCD": {
        "host_username": "player1",
        "room_users": [
            {"sid": "xxx", "username": "player1"},
            {"sid": "yyy", "username": "player2"}
        ]}
        "game_state": "lobby",
        "game_data": {}
    }
 
(example using Enums)

    "roomcode_ABCD": {
        RoomKeys.HOST: "player1",
        RoomKeys.USERS: [
            {UserKeys.SID: "xxx", UserKeys.USERNAME: "player1"},
            {UserKeys.SID: "yyy", UserKeys.USERNAME: "player2"}
        ]}
        RoomKeys.GAME_STATE: GameStates.LOBBY,
        RoomKeys.GAME_DATA: {}
    }

'''

def register_socketio_events(sio):
    """Register SocketIO event handlers and utilities."""
# ----------------------------
#   Event Handlers
# ----------------------------
    @sio.event
    def connect(sid, environ):
        logger.info(f"🔧 connect handler registered for {sid}")
    
    @sio.event
    def disconnect(sid):
        logger.info(f"🔧 disconnect handler registered for {sid}")

        rooms = sio.rooms(sid)
        for room in rooms:
            if room == sid:
                continue  # Skip individual client room

            _remove_user_from_room(room, sid)
            sio.leave_room(sid, room)
            _cleanup_room_DICT()
            server_event_room_update(room)  # Notify others in the room about the update
        
# ----------------------------
#   GET ACTIVE ROOMS
# ----------------------------
    @sio.event
    def client_event_get_active_rooms(sid, data):
        """
        Event Handler for 'client_event_get_active_rooms'

        returns:
        - List of active room names.
        """
        logger.info(f"🔧 Received client_event_get_active_rooms from {sid}")

        rooms = sio.manager.rooms.get('/', {}).keys()  # Get all rooms in the default namespace
        active_rooms = [room for room in rooms if room != sid]  # Exclude individual client rooms

        logger.info(f"🔧 Active rooms: {active_rooms}")

        return active_rooms
    
# ----------------------------
#   GET ROOM DATA
# ----------------------------
    @sio.event
    def client_event_get_room_data(sid, data):
        """
        Event Handler for 'client_event_get_room_data'

        returns:
        - List of active room names.
        """
        logger.info(f"🔧 Received client_event_get_room_data from {sid}")

        return room_DICT.get(data.get("roomcode"), {})




# ----------------------------
#   JOIN ROOM
# ----------------------------
    @sio.event
    def client_event_join_room(sid, data):
        username = data["username"]
        room = data["roomcode"]

        # Prevent duplicates
        if any(u[UserKeys.USERNAME] == username for u in room_DICT.get(room, {}).get(RoomKeys.USERS, [])):
            server_event_room_update(room)  # Notify others in the room about the update
            return {"msg": "Already connected."}
        
        # if room not in room_DICT, set joining user as host
        if room not in room_DICT:
            room_DICT[room] = {RoomKeys.HOST: username, RoomKeys.USERS: []}            

        # Ensure room exists with base keys
        room_DICT.setdefault(room, {
            RoomKeys.USERS: []
        })

        # Add user to the room
        room_DICT[room][RoomKeys.USERS].append({
            UserKeys.SID: sid,
            UserKeys.USERNAME: username
        })

        _cleanup_room_DICT()
        sio.enter_room(sid, room)
        server_event_room_update(room)  # Notify others in the room about the update

        logger.info(f"🔧 +++++++++++++++ {username} ({sid}) joined room: {room}")
        logger.info(f"🔧 +++++++++++++++ connected room_DICT: {room_DICT}")

        return {"data": room_DICT[room]}

# ----------------------------
#   LEAVE ROOM
# ----------------------------
    @sio.event
    def client_event_leave_room(sid, data):
        username = data["username"]
        room = data["roomcode"]

        _remove_user_from_room(room, sid)
        _cleanup_room_DICT()
        sio.leave_room(sid, room)
        server_event_room_update(room)  # Notify others in the room about the update

        logger.info(f"🔧 --------------- {username} ({sid}) left room: {room}")
        logger.info(f"🔧 --------------- connected room_DICT: {room_DICT}")

        return {"msg": f"Left room: {room}"}

# ----------------------------
#   ROOM UPDATE
# ----------------------------
    @sio.event
    def server_event_room_update(roomcode):
        room_data = room_DICT.get(roomcode, [])

        # Include game state in all room updates
        update_data = {
            RoomKeys.HOST: room_data.get(RoomKeys.HOST),
            RoomKeys.USERS: room_data.get(RoomKeys.USERS, []),
            RoomKeys.GAME_STATE: room_data.get(RoomKeys.GAME_STATE, GameStates.LOBBY)
        }

        logger.info(f"🔧 Emitting room update for {roomcode}: {update_data}")
        sio.emit('server_event_room_update', update_data, to=roomcode)

# ----------------------------
#   Helper Functions
# ----------------------------
    def _cleanup_room_DICT():
        # Remove rooms with empty roomcode
        if '' in room_DICT:
            del room_DICT['']
        # Remove users with empty username
        for room, data in list(room_DICT.items()):
            data[RoomKeys.USERS] = [u for u in data[RoomKeys.USERS] if u[UserKeys.USERNAME]]
            # Remove room if now empty
            if not data[RoomKeys.USERS]:
                del room_DICT[room]


    def _remove_user_from_room(room, sid):
        """Remove a user from a room by their session ID."""
        if room in room_DICT:
            room_data = room_DICT[room]
            room_DICT[room][RoomKeys.USERS] = [u for u in room_data[RoomKeys.USERS] if u[UserKeys.SID] != sid]
            # Remove room if "room_users" is now empty
            if not room_DICT[room][RoomKeys.USERS]:
                del room_DICT[room]

# ----------------------------
#   Room - Shout Message
# ----------------------------
        @sio.event
        def client_event_shout_msg(sid, data):
            username = data["username"]
            room = data["roomcode"]

            shout_message = f'{username} shouts, "{random.choice(pirate_shouts_LIST)}"'
            sio.emit('server_event_shout_msg', {'shout_message': shout_message}, to=room)

    





# ----------------------------
#   Part 6. Broadcast Event Handlers - Allows emitting to all connected clients with a single call
# ----------------------------

        # sio.emit('server_event_client_count', {'count': client_count})  # Broadcast to all clients if to=sid is omitted


# ----------------------------
#   Part 7. Rooms - Allows grouping of clients, using emit with room parameter to target specific groups
# ----------------------------


        # if random.random() > 0.5:
        #     sio.enter_room(sid, 'my_room_a')
        #     a_count += 1
        #     sio.emit('server_event_room_count', {'room': 'my_room_a', 'count': a_count}, to='my_room_a') # Broadcast this Server Event to all clients in 'my_room_a'
        # else:
        #     sio.enter_room(sid, 'my_room_b')
        #     b_count += 1
        #     sio.emit('server_event_room_count', {'room': 'my_room_b', 'count': b_count}, to='my_room_b') # Broadcast this Server Event to all clients in 'my_room_b'

    

# ----------------------------
#   Part 8. Authentication
#           Connect event handler receives 'environ' dict with client request info (headers, cookies, IP, etc). Use this to authenticate/authorize clients.
#           Formatted as WSGI environ dict
# ----------------------------




# ----------------------------
#   Part 9. User Sessions
#           Useful for storing information specific to each connected client (e.g., username, preferences, game state).
#           Store info, and when getting event from Client, retrieve info from session.
# ----------------------------






# | Step | Action                                             | What Happens                                   |
# | ---- | -------------------------------------------------- | ---------------------------------------------- |
# | 1️⃣  | Host connects                                      | Server assigns `sid`                           |
# | 2️⃣  | Host emits `create_lobby`                          | Server generates `ABCDE` code                  |
# | 3️⃣  | Other players emit `join_lobby`, `{code: "ABCDE"}` | Server adds them to same room                  |
# | 4️⃣  | Host emits `start_game`                            | Everyone in the room gets `game_started` event |
# | 5️⃣  | Player disconnects                                 | Server removes them from the lobby             |
# | 6️⃣  | Lobby empty                                        | Deleted from memory automatically              |



# Server emit examples:
#     - Emit a welcome message to a newly connected client.
#     - Emit a lobby code to the host after lobby creation.
#     - Emit a confirmation to a player after joining a lobby.
#     - Broadcast a "game started" event to all clients in a lobby.
#     - Emit an updated player count to all clients when someone joins or leaves.
#     - Emit a notification to all clients in a lobby when a player disconnects.
#     - Emit a message to delete a lobby when it becomes empty.


# Client emit examples:
#     - Emit a request to create a lobby.
#     - Emit a request to join a lobby with a specific code.
#     - Emit a request to start the game.
#     - Emit a message or action to leave a lobby.
#     - Emit a chat message to other players in the same lobby.
#     - Emit a disconnect event when leaving the game.
















    # @sio.event
    # def connect(sid, environ): 
    #     '''
    #     args:
    #     - sid = session id, socket io creates a unique session id for each client that connects
    #     - environ = dictionary that contains client request information (headers, cookies, IP address, etc). Perform authentication and authorization here. Decide whether to accept or reject the connection.
    #     '''
    #     client_ip = environ.get('REMOTE_ADDR', 'unknown')
        
    #     # DEBUG: Print EVERYTHING about this connection
    #     print(f"🔧 DEBUG: connect() called with SID: {sid}")
    #     print(f"🔧 DEBUG: SID type: {type(sid)}")
    #     print(f"🔧 DEBUG: SID length: {len(sid)}")
    #     print(f"✅ {sid} connected from {client_ip}")
        
    #     # Use the EXACT SID we received - don't modify it
    #     actual_sid = sid
    #     print(f"🔧 DEBUG: About to emit welcome to: {actual_sid}")
        
    #     # Send welcome message
    #     try:
    #         sio.emit('welcome', {
    #             'message': 'Ahoy! Welcome aboard the pirate ship! 🏴‍☠️',
    #             'sid': actual_sid
    #         }, room=actual_sid)
    #         print(f"🔧 DEBUG: Welcome message sent successfully to {actual_sid}")
    #     except Exception as e:
    #         print(f"🚫 ERROR sending welcome: {e}")

    # @sio.event
    # def disconnect(sid):
    #     print(f"❌ {sid} disconnected")

    # @sio.event
    # def test_message(sid, data):
    #     '''Handle test messages from clients'''
    #     print(f"📬 Message from {sid}: {data}")
    #     sio.emit('response', {
    #         'message': f'Captain received: {data}',
    #         'sid': sid
    #     }, room=sid)  # Make sure we're responding to the right client

    # @sio.event
    # def test_message_b(sid, data):
    #     '''Handle test messages from clients'''
    #     print(f"📬 Message from {sid}: {data}")
    #     sio.emit('responseB', {
    #         'message': f'Captain B: {data}',
    #         'sid': sid
    #     }, room=sid)  # Make sure we're responding to the right client
        
