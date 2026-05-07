import os

def test_get_google_maps_key(client, app):
    fake_key = "FAKE_KEY_GOOGLE_MAPS"
    with app.app_context():
        os.environ["GOOGLE_MAPS_KEY"] = fake_key
        response = client.get('/api/get-google-maps-key')
        assert response.status_code == 200
        data = response.get_json()
        assert 'google_maps_key' in data
        assert data['google_maps_key'] == fake_key

def test_get_strava_client_id(client, app):
    fake_key = "FAKE_KEY_strava"
    with app.app_context():
        os.environ["STRAVA_CLIENT_ID"] = fake_key
        response = client.get('/api/get-strava-client-id')
        assert response.status_code == 200
        data = response.get_json()
        assert 'strava_client_id' in data
        assert data['strava_client_id'] == fake_key
