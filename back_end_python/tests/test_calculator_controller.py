from collections import Counter
from urllib.parse import quote

from bikecalc.models import Crankset, Cassette, Tyre
from bikecalc.calculator import calculate_ratios, calculate_rollouts, calculate_speeds
from bikecalc.database import db

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
    manual_chainrings = "52,36"
    manual_cassette_sprockets = "11,12,13,14,15,16,17,19,21,24,27,30"

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
    manual_chainrings = "52,36"
    manual_cassette_sprockets = "11,12,13,14,15,16,17,19,21,24,27,30"

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
    manual_chainrings = "52,36"
    manual_cassette_sprockets = "11,12,13,14,15,16,17,19,21,24,27,30"

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
