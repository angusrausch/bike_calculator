import os

def test_get_google_maps_key(client, app):
    with app.app_context():
        response = client.get('/health')
        assert response.status_code == 200