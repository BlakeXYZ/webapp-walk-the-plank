import logging
import random
logger = logging.getLogger(__name__)

import socketio
from . import sio

client_count = 0
a_count = 0
b_count = 0


def register_socketio_events(sio):

# ----------------------------
#   Background Task
# ----------------------------
    def task_send_multiply_request(sid):
        """Background task: Ask client to multiply two numbers and return the result using .js cb (callback) and sio.call."""
        sio.sleep(2)
        result = sio.call('server_event_multiply', {'nums': [5, 5]}, to=sid)
        logger.info(f"🔧 my_task -- server_event_multiply result using sio.call: {result}")



# ----------------------------
#   Event Handlers
# ----------------------------
    @sio.event
    def connect(sid, environ):
        logger.info(f"🔧 connect handler registered for {sid}")

        global client_count
        global a_count
        global b_count

        username = environ.get('HTTP_X_USERNAME') # Authentication - Custom header from client
        logger.info(f"🔧 Authenticating user: {username}")
        if not username:
            raise socketio.exceptions.ConnectionRefusedError('Sorry, Authentication failed! 😢')

        client_count += 1
        sio.emit('server_event_client_count', {'count': client_count})  # Broadcast to all clients if to=sid is omitted

        if random.random() > 0.5:
            sio.enter_room(sid, 'my_room_a')
            a_count += 1
            sio.emit('server_event_room_count', {'room': 'my_room_a', 'count': a_count}, to='my_room_a') # Broadcast this Server Event to all clients in 'my_room_a'
        else:
            sio.enter_room(sid, 'my_room_b')
            b_count += 1
            sio.emit('server_event_room_count', {'room': 'my_room_b', 'count': b_count}, to='my_room_b') # Broadcast this Server Event to all clients in 'my_room_b'

    
        # Broadcast Server Event to Client.
        sio.start_background_task(task_send_multiply_request, sid)

    @sio.event
    def disconnect(sid):
        logger.info(f"🔧 disconnect handler registered for {sid}")

        global client_count
        global a_count
        global b_count
        client_count -= 1
        sio.emit('server_event_client_count', {'count': client_count})  # Broadcast to all clients if to=sid is omitted

        if 'my_room_a' in sio.rooms(sid):
            a_count -= 1
            sio.emit('server_event_room_count', {'room': 'my_room_a', 'count': a_count}, to='my_room_a') # Broadcast this Server Event to all clients in 'my_room_a'
        else:
            b_count -= 1
            sio.emit('server_event_room_count', {'room': 'my_room_b', 'count': b_count}, to='my_room_b') # Broadcast this Server Event to all clients in 'my_room_b'


    @sio.event
    def client_event_sum(sid, data):
        """
        Event Handler for 'client_event_sum'

        returns:
        - Dictionary with the sum of two numbers sent by the client.
        """
        logger.info(f"🔧 Received client_event_sum - {data} from {sid}")

        result = data['nums'][0] + data['nums'][1]
        logger.info(f"🔧 Computed sum: {result}")

        return {'result': result}


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
        
