# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
import os
import logging
import sys

from flask import Flask, render_template
import socketio

from my_flask_app import commands, public, user
from my_flask_app.extensions import (
    bcrypt,
    cache,
    csrf_protect,
    db,
    debug_toolbar,
    flask_static_digest,
    login_manager,
    migrate,
)

allowed_socket_cors_origins = os.getenv('SOCKET_CORS_ORIGINS')
allowed_socket_cors_origins_LIST = [allowed_socket_cors_origins.strip() for allowed_socket_cors_origins in allowed_socket_cors_origins.split(',')] 
print(f"🔧 DEBUG: Allowed origins for CORS: {allowed_socket_cors_origins_LIST}")
print(f"🔧 DEBUG: Creating Socket.IO server instance")

sio = socketio.Server(
    async_mode='gevent', 
    cors_allowed_origins=allowed_socket_cors_origins_LIST,
    logger=True,
    engineio_logger=True
) 

print(f"🔧 DEBUG: Socket.IO server created: {sio}")
print(f"🔧 DEBUG: Socket.IO server ID: {id(sio)}")

@sio.event
def connect(sid, environ): 
    '''
    args:
    - sid = session id, socket io creates a unique session id for each client that connects
    - environ = dictionary that contains client request information (headers, cookies, IP address, etc). Perform authentication and authorization here. Decide whether to accept or reject the connection.
    '''
    client_ip = environ.get('REMOTE_ADDR', 'unknown')
    
    # DEBUG: Print EVERYTHING about this connection
    print(f"🔧 DEBUG: connect() called with SID: {sid}")
    print(f"🔧 DEBUG: SID type: {type(sid)}")
    print(f"🔧 DEBUG: SID length: {len(sid)}")
    print(f"✅ {sid} connected from {client_ip}")
    
    # Use the EXACT SID we received - don't modify it
    actual_sid = sid
    print(f"🔧 DEBUG: About to emit welcome to: {actual_sid}")
    
    # Send welcome message
    try:
        sio.emit('welcome', {
            'message': 'Ahoy! Welcome aboard the pirate ship! 🏴‍☠️',
            'sid': actual_sid
        }, room=actual_sid)
        print(f"🔧 DEBUG: Welcome message sent successfully to {actual_sid}")
    except Exception as e:
        print(f"🚫 ERROR sending welcome: {e}")


@sio.event
def disconnect(sid):
    print(f"❌ {sid} disconnected")

@sio.event
def test_message(sid, data):
    '''Handle test messages from clients'''
    print(f"📬 Message from {sid}: {data}")
    sio.emit('response', {
        'message': f'Captain received: {data}',
        'sid': sid
    }, room=sid)  # Make sure we're responding to the right client
    
#TODO: Move the above socketio event handlers to a separate module and import them here.

def create_app(config_object="my_flask_app.settings"):
    """Create application factory, as explained here: http://flask.pocoo.org/docs/patterns/appfactories/.

    :param config_object: The configuration object to use.
    """
    app = Flask(__name__.split(".")[0])
    app.config.from_object(config_object)


    register_extensions(app)
    register_blueprints(app)
    register_errorhandlers(app)
    register_shellcontext(app)
    register_commands(app)
    configure_logger(app)
    
    # wrap Flask application with socketio's WSGI application
    app.wsgi_app = socketio.WSGIApp(
        sio, 
        app.wsgi_app
        )
    return app


def register_extensions(app):
    """Register Flask extensions."""
    bcrypt.init_app(app)
    cache.init_app(app)
    db.init_app(app)
    csrf_protect.init_app(app)
    login_manager.init_app(app)
    debug_toolbar.init_app(app)
    migrate.init_app(app, db)
    flask_static_digest.init_app(app)
    return None


def register_blueprints(app):
    """Register Flask blueprints."""
    app.register_blueprint(public.views.blueprint)
    app.register_blueprint(user.views.blueprint)
    return None


def register_errorhandlers(app):
    """Register error handlers."""

    def render_error(error):
        """Render error template."""
        # If a HTTPException, pull the `code` attribute; default to 500
        error_code = getattr(error, "code", 500)
        return render_template(f"{error_code}.html"), error_code

    for errcode in [401, 404, 500]:
        app.errorhandler(errcode)(render_error)
    return None


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"db": db, "User": user.models.User}

    app.shell_context_processor(shell_context)


def register_commands(app):
    """Register Click commands."""
    app.cli.add_command(commands.test)
    app.cli.add_command(commands.lint)


def configure_logger(app):
    """Configure loggers."""
    handler = logging.StreamHandler(sys.stdout)
    if not app.logger.handlers:
        app.logger.addHandler(handler)
