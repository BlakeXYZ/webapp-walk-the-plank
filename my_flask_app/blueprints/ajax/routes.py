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
    form = RegisterForm(data=data, activeRooms=data.get('activeRooms', []))

    form.join_room.data = data.get("submitType") == "join_room"
    form.create_room.data = data.get("submitType") == "create_room"
    form.active_rooms.data = data.get("activeRooms", "")

    logger.debug(f"🛠️ DEBUG: ------------ Received AJAX data: {data}")

    if form.validate():
        if data.get("submitType") == "join_room":
            session['username'] = form.username.data
            session['roomcode'] = form.roomcode.data

            return jsonify({"success": True, "submitType": "join_room", "roomcode": form.roomcode.data})

        if data.get("submitType") == "create_room":
            session['username'] = form.username.data


    else:
        # Collect field errors to return inline
        for field in form:
            if field.errors:
                return {"errors": {field.name: field.errors}}

    # data = request.json
    # return jsonify({"message": 'HOWDY, AJAX route is working!', "data": data})



####
#### EXAMPLE views.py for voting module
####
# from flask import Blueprint, jsonify, request

# from webapp_hamburg_vs_hotdog.database import db

# from webapp_hamburg_vs_hotdog.blueprints.voting.models import Contestant, Matchup, Vote
# from webapp_hamburg_vs_hotdog.blueprints.voting.utils.get_matchup_stats import get_matchup_stats

# blueprint = Blueprint("voting", __name__)

# @blueprint.route("/on_click_vote/", methods=["POST"])
# def on_click_vote():
#     data = request.get_json()
#     matchup_id = int(data['matchup_id'])
#     contestant_id = int(data['contestant_id'])
#     session_id = str(data['session_id'])
#     # country_code = str(data['country_code'])
#     # region_code = str(data['region_code'])

#     vote = Vote.query.filter_by(matchup_id=matchup_id, session_id=session_id).first()
#     contestant_id_name = Contestant.query.get(contestant_id).contestant_name

#     if vote is None:
#         # 1. Session never Voted: create new vote
#         vote = Vote(
#             matchup=matchup_id,
#             contestant=contestant_id,
#             session_id=session_id,
#             country_code="DE",  # TODO: Placeholder, replace with actual country code logic
#         )
#         db.session.add(vote)
#         message = f"Voted for {contestant_id_name}!"
#     elif vote.contestant_id == contestant_id:
#         # 2. Session voted for same contestant: remove vote
#         db.session.delete(vote) 
#         message = "Vote removed!"
#     else:
#         # 3. Session voted for different contestant: switch vote
#         vote.contestant_id = contestant_id
#         message = f"Vote switched to {contestant_id_name}!"

#     db.session.commit()

#     matchup_id = Matchup.query.get(matchup_id)
#     return jsonify(get_matchup_stats(matchup=matchup_id, message=message, session_id=session_id))


# @blueprint.route("/api/matchup_stats/", methods=["GET"])
# def api_matchup_stats():
#     """Return stats for all matchups as JSON, with optional session_id."""
#     session_id = request.args.get('session_id')
#     matchups = Matchup.query.all()
#     stats = {m.id: get_matchup_stats(m, session_id=session_id) for m in matchups}
#     return jsonify(stats)