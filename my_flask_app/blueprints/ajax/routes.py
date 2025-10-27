from flask import Blueprint, render_template, request, jsonify, session
from my_flask_app.user.forms import RegisterForm
import logging

logger = logging.getLogger(__name__)

blueprint = Blueprint('ajax', __name__, url_prefix='/ajax')

@blueprint.route('/create_lobby', methods=['POST'])
def create_lobby():
    data = request.json
    # Handle lobby creation logic here
    return jsonify({"status": "success", "data": data}), 201

@blueprint.route('/onClick_create_or_join_room', methods=['POST'])
def onClick_create_or_join_room():
    data = request.json
    active_rooms = data.get('activeRooms', [])
    form = RegisterForm(data=data, activeRooms=active_rooms)

    form.join_room.data = data.get("submitType") == "join_room"
    form.create_room.data = data.get("submitType") == "create_room"
    form.active_rooms.data = data.get("activeRooms", "")

    logger.debug(f"🛠️ DEBUG: ------------ Received AJAX data: {data}")

    #TODO: from socket client lobby.js pass in DICT of socketio room data
    # and compare against user entered roomcode to validate if room exists

    if form.validate():
        if form.join_room.data:
            session['username'] = form.username.data
            session['roomcode'] = form.roomcode.data
        elif form.create_room.data:
            session['username'] = form.username.data
            session['roomcode'] = build_roomcode(active_rooms)
        else:
            return {"errors": {"submitType": ["Please select Join Room or Create Room."]}}

        logger.info(f"🔧 ~~~ INFO: AJAX form validated successfully with data: {form.data}")
        return jsonify({"payload": form.data, "success": True})
    else:
        # Collect field errors to return inline
        for field in form:
            if field.errors:
                return {"errors": {field.name: field.errors}}


def build_roomcode(active_rooms=None):
    import random
    import string
    length=4
    roomcode = ''.join(random.choices(string.ascii_uppercase, k=length))
    if active_rooms:
        while roomcode in active_rooms:
            roomcode = ''.join(random.choices(string.ascii_uppercase, k=length))
    return roomcode


@blueprint.route('/onClick_start_game', methods=['POST'])
def onClick_start_game():
    data = request.json
    room_users = data.get('room_users')
    room_user_count = len(room_users) if room_users else 0
    room_user_count_to_start_game = data.get('room_user_count_to_start_game', 3)

    logger.debug(f"🛠️ DEBUG: ------------ onClick_start_game received data: {data}")

    # Add your start game logic here
    # For example, validate the user and room, then start the game

    if room_user_count < room_user_count_to_start_game:
        return jsonify({"status": "error", "errors": [f"At least {room_user_count_to_start_game} players are required to start the game."]})

    return jsonify({"status": "success", "message": f"Game started with {room_user_count} users."})