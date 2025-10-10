import logging
logger = logging.getLogger(__name__)

from . import sio


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

        # Sending Event to Client from Server.
        sio.start_background_task(task_send_multiply_request, sid)
    
    @sio.event
    def disconnect(sid):
        logger.info(f"🔧 disconnect handler registered for {sid}")


    @sio.event
    def client_event_sum(sid, data):
        logger.info(f"🔧 Received client_event_sum - {data} from {sid}")

        result = data['nums'][0] + data['nums'][1]
        logger.info(f"🔧 Computed sum: {result}")

        return {'result': result}
































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
        
