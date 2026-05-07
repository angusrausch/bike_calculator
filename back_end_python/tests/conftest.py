import pytest
from bikecalc import create_app


@pytest.fixture
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
    })
    with app.app_context():
        from bikecalc.database import db
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def fake_bike_data(app):
    """Insert fake data for Cassette, Crankset, and Tyre using test_calculator.py values."""
    from bikecalc.database import db
    from bikecalc.models import Cassette, Crankset, Tyre
    cassettes = [
        Cassette(name="Test Cassette 1", sprockets=[11,12,13,14,15,16,17,19,21,24,27,30]),
        Cassette(name="Test Cassette 2", sprockets=[12,14,16,18,21,24,28]),
        Cassette(name="Test Cassette 3", sprockets=[10,12,14,17,19,21,23,25])
    ]
    cranksets = [
        Crankset(name="Test Crankset 1", rings=[52, 36]),
        Crankset(name="Test Crankset 2", rings=[50, 34]),
        Crankset(name="Test Crankset 3", rings=[53, 39])
    ]
    tyres = [
        Tyre(name="Test Tyre 1", circumference=2128),
        Tyre(name="Test Tyre 2", circumference=2100),
        Tyre(name="Test Tyre 3", circumference=2000)
    ]
    db.session.add_all(cassettes + cranksets + tyres)
    db.session.commit()
    yield
    db.session.rollback()
