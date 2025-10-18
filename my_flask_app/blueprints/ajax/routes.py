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

@blueprint.route('/test_ajax', methods=['POST'])
def test_ajax():
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
            return {"errors": {"submitType": ["Please select <strong>Join Room</strong> or <strong>Create Room</strong>."]}}

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