import os
import socketio

'''Set up Socket.IO server with CORS origins from environment variable'''

allowed_socket_cors_origins = os.getenv('SOCKET_CORS_ORIGINS')
allowed_socket_cors_origins_LIST = [origin.strip() for origin in allowed_socket_cors_origins.split(',')]

sio = socketio.Server(
    async_mode='gevent',
    cors_allowed_origins=["https://walktheplank.app", "https://www.walktheplank.app"],
    logger=True,
    engineio_logger=True
)