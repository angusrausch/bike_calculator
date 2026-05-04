from flask import Blueprint, request, jsonify
from .environment import get_google_maps_key, get_strava_client_id, get_strava_secret, FRONTEND_URL

def create_key_blueprint():
    bp = Blueprint('key_api', __name__)


    @bp.route("/api/get-google-maps-key")
    def google_maps_key_endpoint():
        return jsonify({"google_maps_key": get_google_maps_key()})


    @bp.route("/api/get-strava-client-id")
    def strava_client_id_endpoint():
        return jsonify({"strava_client_id": get_strava_client_id()})

    @bp.route("/api/strava-login")
    def post_strava_login():
        code = request.args.get('code')
        return 404

    return bp