from flask import Blueprint, request, jsonify, make_response
import requests
from .environment import get_google_maps_key, get_strava_client_id, get_strava_secret, FRONTEND_URL, SECURE_FRONTEND

def create_key_blueprint():
    bp = Blueprint('key_api', __name__)


    @bp.route("/api/get-google-maps-key")
    def google_maps_key_endpoint():
        return jsonify({"google_maps_key": get_google_maps_key()})


    @bp.route("/api/get-strava-client-id")
    def strava_client_id_endpoint():
        return jsonify({"strava_client_id": get_strava_client_id()})

    # Cannot test below using pytest

    @bp.route("/api/strava-login", methods=['POST'])
    def post_strava_login(): # pragma: no cover 
        code = request.args.get('code')
        if not code:
            return jsonify({"error": "Missing code parameter"}), 400
        token_url = "https://www.strava.com/oauth/token"
        data = {
            "client_id": get_strava_client_id(),
            "client_secret": get_strava_secret(),
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": FRONTEND_URL
        }
        response = requests.post(token_url, data=data, timeout=16)
        if response.status_code != 200:
            return jsonify({"error": "Failed to exchange token with Strava"}), 400

        data_json = response.json()
        refresh_token = data_json.get("refresh_token")
        if not refresh_token:
            return jsonify({"error": "No refresh token returned from Strava"}), 400

        cookie = f"strava_refresh_token={refresh_token}; HttpOnly; Path=/; Max-Age={30*24*60*60}; SameSite=Strict; {'Secure' if SECURE_FRONTEND else ''}"
        resp = make_response(jsonify(data_json))
        resp.headers.add('Set-Cookie', cookie)
        return resp

    @bp.route("/api/strava-refresh", methods=['POST'])
    def strava_refresh(): # pragma: no cover 
        refresh_token = request.cookies.get("strava_refresh_token")
        if not refresh_token:
            return jsonify({"error": "No active session (missing cookie)"}), 401
        token_url = "https://www.strava.com/oauth/token"
        data = {
            "client_id": get_strava_client_id(),
            "client_secret": get_strava_secret(),
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        response = requests.post(token_url, data=data, timeout=16)
        if response.status_code != 200:
            return jsonify({"error": "Failed to refresh token"}), 401
        data_json = response.json()
        new_refresh_token = data_json.get("refresh_token")
        if not new_refresh_token:
            return jsonify({"error": "No refresh token returned from Strava"}), 401
        cookie = f"strava_refresh_token={new_refresh_token}; HttpOnly; Path=/; Max-Age={30*24*60*60}; SameSite=Strict; {'Secure' if SECURE_FRONTEND else ''}"
        resp = make_response(jsonify(data_json))
        resp.headers.add('Set-Cookie', cookie)
        return resp

    @bp.route("/api/strava-logout", methods=['POST'])
    def strava_logout(): # pragma: no cover 
        access_token = request.args.get('accessToken') or request.json.get('accessToken') if request.is_json else None
        if not access_token:
            return jsonify({"error": "Missing accessToken"}), 400
        deauth_url = "https://www.strava.com/oauth/deauthorize"
        headers = {"Authorization": f"Bearer {access_token}"}
        try:
            response = requests.post(deauth_url, headers=headers, timeout=10)
        except Exception as e:
            print(f"Error calling Strava deauthorize: {e}")
            response = None
        # Clear the cookie regardless of Strava response
        cookie = f"strava_refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; {'Secure' if SECURE_FRONTEND else ''}"
        resp = make_response(jsonify({"message": "Logged out"}))
        resp.headers.add('Set-Cookie', cookie)
        return resp

    return bp