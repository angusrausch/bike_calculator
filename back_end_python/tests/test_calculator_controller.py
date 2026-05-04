from collections import Counter
from urllib.parse import quote

from bikecalc.models import Crankset, Cassette, Tyre
from bikecalc.calculator import calculate_ratios, calculate_rollouts, calculate_speeds
from bikecalc.database import db


manual_chainrings = "52,36"
manual_cassette_sprockets = "11,12,13,14,15,16,17,19,21,24,27,30"

broken_manual_cassette_sprockets = "a,b,c"
broken_manual_chainrings = "a,b"


def test_get_cassettes(client, fake_bike_data):
    response = client.get('/api/cassettes')
    assert response.status_code == 200
    data = response.get_json()

    assert type(data) == list
    assert len(data) > 0

    assert data[0] != data[1]

    first_element = data[0]
    assert "name" in first_element
    assert type(first_element["sprockets"]) == list

def test_get_cranksets(client, fake_bike_data):
    response = client.get('/api/cranksets')
    assert response.status_code == 200
    data = response.get_json()

    assert type(data) == list
    assert len(data) > 0

    assert data[0] != data[1]

    first_element = data[0]
    assert type(first_element["name"]) == str
    assert type(first_element["rings"]) == list

def test_get_tyres(client, fake_bike_data):
    response = client.get('/api/tyres')
    assert response.status_code == 200
    data = response.get_json()

    assert type(data) == list
    assert len(data) > 0

    assert data[0] != data[1]

    first_element = data[0]
    assert type(first_element["name"]) == str
    assert type(first_element["circumference"]) == int

def test_get_calculate_ratios(client, fake_bike_data, app):
    base_path = "/api/calculate/ratio"
    params = "crankset_id=1&cassette_id=1"
    full_path = base_path + "?" + params
    with app.app_context():
        crankset = db.session.get(Crankset, 1)
        cassette = db.session.get(Cassette, 1)
        assert crankset is not None, "Crankset with id=1 not found. Check test data seeding."
        assert cassette is not None, "Cassette with id=1 not found. Check test data seeding."
        expected_chainrings = crankset.rings
        expected_sprockets = cassette.sprockets
    response = client.get(full_path)
    assert response.status_code == 200
    data = response.get_json()

    assert Counter(data["chainrings"]) == Counter(expected_chainrings)
    assert Counter(data["sprockets"]) == Counter(expected_sprockets)
    
    assert calculate_ratios(expected_chainrings, expected_sprockets) == data["results"]

def test_get_calculate_rollout(client, fake_bike_data, app):
    base_path = "/api/calculate/rollout"
    params = "crankset_id=1&cassette_id=1&tyre_id=1"
    full_path = base_path + "?" + params
    with app.app_context():
        crankset = db.session.get(Crankset, 1)
        cassette = db.session.get(Cassette, 1)
        tyre = db.session.get(Tyre, 1)
        assert crankset is not None, "Crankset with id=1 not found. Check test data seeding."
        assert cassette is not None, "Cassette with id=1 not found. Check test data seeding."
        assert tyre is not None, "Tyre with id=1 not found. Check test data seeding."
        expected_chainrings = crankset.rings
        expected_sprockets = cassette.sprockets
        expected_circumference = tyre.circumference
    response = client.get(full_path)
    assert response.status_code == 200
    data = response.get_json()

    assert Counter(data["chainrings"]) == Counter(expected_chainrings)
    assert Counter(data["sprockets"]) == Counter(expected_sprockets)
    
    assert calculate_rollouts(expected_chainrings, expected_sprockets, expected_circumference) == data["results"]

def test_get_calculate_speed(client, fake_bike_data, app):
    base_path = "/api/calculate/speed"
    params = "crankset_id=1&cassette_id=1&tyre_id=1&min_cadence=50&max_cadence=100&cadence_increment=10"
    full_path = base_path + "?" + params
    with app.app_context():
        crankset = db.session.get(Crankset, 1)
        cassette = db.session.get(Cassette, 1)
        tyre = db.session.get(Tyre, 1)
        assert crankset is not None, "Crankset with id=1 not found. Check test data seeding."
        assert cassette is not None, "Cassette with id=1 not found. Check test data seeding."
        assert tyre is not None, "Tyre with id=1 not found. Check test data seeding."
        expected_chainrings = crankset.rings
        expected_sprockets = cassette.sprockets
        expected_circumference = tyre.circumference
    cadence_list = [cadence for cadence in range(50, 100 + 1, 10)]

    response = client.get(full_path)
    assert response.status_code == 200
    data = response.get_json()

    assert Counter(data["chainrings"]) == Counter(expected_chainrings)
    assert Counter(data["sprockets"]) == Counter(expected_sprockets)
    assert Counter(data["cadences"]) == Counter(cadence_list)
    
    assert calculate_speeds(expected_chainrings, expected_sprockets, expected_circumference, cadence_list) == data["results"]

def test_get_calculate_ratios_manual_input(client, app):
    base_path = "/api/calculate/ratio"
    params = "manual_chainring=" + quote(manual_chainrings) + "&manual_cassette=" + quote(manual_cassette_sprockets)
    full_path = base_path + "?" + params

    expected_chainrings = [int(chainring) for chainring in manual_chainrings.split(',')]
    expected_sprockets = [int(sprocket) for sprocket in manual_cassette_sprockets.split(',')]

    response = client.get(full_path)
    assert response.status_code == 200
    data = response.get_json()

    assert Counter(data["chainrings"]) == Counter(expected_chainrings)
    assert Counter(data["sprockets"]) == Counter(expected_sprockets)
    
    assert calculate_ratios(expected_chainrings, expected_sprockets) == data["results"]

def test_get_calculate_rollout_manual_input(client, fake_bike_data, app):
    base_path = "/api/calculate/rollout"
    params = "manual_chainring=" + quote(manual_chainrings) + "&manual_cassette=" + quote(manual_cassette_sprockets) + "&tyre_id=1"
    full_path = base_path + "?" + params
    with app.app_context():
        tyre = db.session.get(Tyre, 1)
        assert tyre is not None, "Tyre with id=1 not found. Check test data seeding."
        expected_circumference = tyre.circumference
    expected_chainrings = [int(chainring) for chainring in manual_chainrings.split(',')]
    expected_sprockets = [int(sprocket) for sprocket in manual_cassette_sprockets.split(',')]

    response = client.get(full_path)
    assert response.status_code == 200
    data = response.get_json()


    assert Counter(data["chainrings"]) == Counter(expected_chainrings)
    assert Counter(data["sprockets"]) == Counter(expected_sprockets)
    
    assert calculate_rollouts(expected_chainrings, expected_sprockets, expected_circumference) == data["results"]

def test_get_calculate_speed_manual_input(client, fake_bike_data, app):
    base_path = "/api/calculate/speed"
    params = "manual_chainring=" + quote(manual_chainrings) + "&manual_cassette=" + quote(manual_cassette_sprockets) + "&tyre_id=1&min_cadence=50&max_cadence=100&cadence_increment=10"
    full_path = base_path + "?" + params
    with app.app_context():
        tyre = db.session.get(Tyre, 1)
        assert tyre is not None, "Tyre with id=1 not found. Check test data seeding."
        expected_circumference = tyre.circumference
    cadence_list = [cadence for cadence in range(50, 100 + 1, 10)]
    expected_chainrings = [int(chainring) for chainring in manual_chainrings.split(',')]
    expected_sprockets = [int(sprocket) for sprocket in manual_cassette_sprockets.split(',')]

    response = client.get(full_path)
    assert response.status_code == 200
    data = response.get_json()

    assert Counter(data["chainrings"]) == Counter(expected_chainrings)
    assert Counter(data["sprockets"]) == Counter(expected_sprockets)
    assert Counter(data["cadences"]) == Counter(cadence_list)
    
    assert calculate_speeds(expected_chainrings, expected_sprockets, expected_circumference, cadence_list) == data["results"]

def test_calculate_incorrect_manual_values(client):
    base_paths = ["/api/calculate/ratio", "/api/calculate/rollout", "/api/calculate/speed"]

    for base_path in base_paths:
        # Check we get invalid manual cassette
        broken_manual_cassette_path = base_path + "?tyre_id=1&manual_chainring=" + quote(manual_chainrings) + "&manual_cassette=" + quote(broken_manual_cassette_sprockets)
        response = client.get(broken_manual_cassette_path)
        assert response.status_code == 400
        assert response.get_json()["error"] == "Invalid Manual Cassette"

        # Check we get invalid manual chainrings
        broken_manual_crankset_path = base_path + "?tyre_id=1&manual_chainring=" + quote(broken_manual_chainrings) + "&manual_cassette=" + quote(manual_cassette_sprockets)
        response = client.get(broken_manual_crankset_path)
        assert response.status_code == 400
        assert response.get_json()["error"] == "Invalid Manual Crankset"

def test_calculate_invalid_ids(client, fake_bike_data):
    base_paths = ["/api/calculate/ratio", "/api/calculate/rollout", "/api/calculate/speed"]

    for base_path in base_paths:
        # Check we get invalid cassette id
        broken_manual_cassette_path = base_path + "?crankset_id=1&cassette_id=999&tyre_id=1"
        response = client.get(broken_manual_cassette_path)
        assert response.status_code == 404
        assert response.get_json()["error"] == "Cassette not found"

        # Check we get invalid chainring id
        broken_manual_crankset_path = base_path + "?crankset_id=999&cassette_id=1&tyre_id=1"
        response = client.get(broken_manual_crankset_path)
        assert response.status_code == 404
        assert response.get_json()["error"] == "Crankset not found"

        # Check we get invalid tyre id
        if "ratio" not in base_path:
            broken_manual_crankset_path = base_path +"?crankset_id=1&cassette_id=1&tyre_id=999"
            response = client.get(broken_manual_crankset_path)
            assert response.status_code == 404
            assert response.get_json()["error"] == "Tyre not found"
