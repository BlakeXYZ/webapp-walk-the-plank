from calendar import c
import logging
import random
logger = logging.getLogger(__name__)

from my_flask_app import user
import socketio
from . import sio

client_count = 0
a_count = 0
b_count = 0

room_DICT = {} # Structure: { roomcode1: [ {sid: xxx, username: xxx}, ... ], roomcode2: [ ... ] }
 
pirate_shouts = [
    "Ahoy!",
    "Yarrgh!",
    "Avast ye Landlubbers!",
    "Yo ho ho!",
    "Swab the poop deck!",
    "Aye Matey!",
    "Blimey!",
    "Shiver me timbers!",
    "Heave ho!",
    "What’s the Scuttlebutt!",
    "Raise the Jolly Roger!",
    "All hands on deck!",
    "Batten down the hatches!",
    "Hoist the mainsail!",
    "Pieces o’ eight!",
    "Dead men tell no tales!",
    "Weigh anchor!",
    "By Blackbeard’s beard!",
    "Walk the plank!",
    "Ho ho, haul away!",
    "Fetch me rum!",
    "Belay that order!",
    "Arr, me hearties!",
    "Scurvy dogs!",
    "Yo ho, me bucko!",
    "To the briny deep!",
    "Thar she blows!",
    "Keep a weather eye!",
    "Mark me words!",
    "A storm’s brewin’!",
    "Haul wind!",
    "Sink me!",
    "Lay to, ye scallywags!",
    "Splice the mainbrace!",
    "Man the cannons!",
    "Blow me down!",
    "Hold fast!",
    "A fair wind and a following sea!",
    "Fire in the hole!",
    "Heave to!",
    "Yo ho, hoist yer mug!"
]



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

            if room in room_DICT:
                room_DICT[room] = [u for u in room_DICT[room] if u["sid"] != sid]
                if not room_DICT[room]:
                    del room_DICT[room]

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
#   JOIN ROOM
# ----------------------------
    @sio.event
    def client_event_join_room(sid, data):
        username = data["username"]
        room = data["roomcode"]

        # Prevent duplicates
        if any(u["username"] == username for u in room_DICT.get(room, [])):
            server_event_room_update(room)  # Notify others in the room about the update
            return {"msg": "Already connected."}

        room_DICT.setdefault(room, []).append({"sid": sid, "username": username})
        _cleanup_room_DICT()
        sio.enter_room(sid, room)
        server_event_room_update(room)  # Notify others in the room about the update

        logger.info(f"🔧 +++++++++++++++ {username} ({sid}) joined room: {room}")
        logger.info(f"🔧 +++++++++++++++ connected_users_DICT: {room_DICT}")

        return {"msg": f"Joined room: {room}"}

# ----------------------------
#   LEAVE ROOM
# ----------------------------
    @sio.event
    def client_event_leave_room(sid, data):
        username = data["username"]
        room = data["roomcode"]

        if room in room_DICT:
            room_DICT[room] = [u for u in room_DICT[room] if u["sid"] != sid]
            if not room_DICT[room]:
                del room_DICT[room]

        _cleanup_room_DICT()
        sio.leave_room(sid, room)
        server_event_room_update(room)  # Notify others in the room about the update

        logger.info(f"🔧 --------------- {username} ({sid}) left room: {room}")
        logger.info(f"🔧 --------------- connected_users_DICT: {room_DICT}")

        return {"msg": f"Left room: {room}"}

# ----------------------------
#   ROOM UPDATE
# ----------------------------
    @sio.event
    def server_event_room_update(roomcode):
        room_members = room_DICT.get(roomcode, [])
        user_count = len(room_members)

        update_data = {
            'room_user_count': user_count,
            'room_username_list': [u['username'] for u in room_members]
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
        for room, users in list(room_DICT.items()):
            room_DICT[room] = [u for u in users if u['username']]
            # Remove room if now empty
            if not room_DICT[room]:
                del room_DICT[room]


# ----------------------------
#   Room Management - Shout, Leave
# ----------------------------
        @sio.event
        def client_event_shout_msg(sid, data):
            username = data["username"]
            room = data["roomcode"]

            shout_message = f'{username} shouts, "{random.choice(pirate_shouts)}"'
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
        
