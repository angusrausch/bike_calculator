from bikecalc.models import Crankset, Cassette, Tyre
from bikecalc.database import db

def test_insert_cassette(fake_bike_data):
    test_cassette = Cassette(f"insert_test", [11,12,13])
    db.session.add(test_cassette)
    db.session.commit()

    # Check it is in DB
    last_cassette = Cassette.query.order_by(Cassette.id.desc()).first()
    assert last_cassette == test_cassette

def test_insert_crankset(fake_bike_data):
    test_crankset = Crankset(f"insert_test", [11,12,13])
    db.session.add(test_crankset)
    db.session.commit()

    # Check it is in DB
    last_crankset = Crankset.query.order_by(Crankset.id.desc()).first()
    assert last_crankset == test_crankset

def test_insert_tyre(fake_bike_data):
    test_tyre = Tyre(f"insert_test", 200)
    db.session.add(test_tyre)
    db.session.commit()

    # Check it is in DB
    last_tyre = Tyre.query.order_by(Tyre.id.desc()).first()
    assert last_tyre == test_tyre
