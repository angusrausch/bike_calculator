import pytest

from bikecalc.models import Crankset, Cassette, Tyre
from bikecalc.database import db


def test_cassette_functions():
    test_cases = [
        ("explicit_name", [11, 12, 13], "explicit_name"),
        (None, [11, 12, 13], "11-13 (3 Speed)"),
        (None, [15], "15 Single Speed"),
        (None, "11,12,13", "11-13 (3 Speed)"),
        (None, "15", "15 Single Speed"),
        (None, 15, "15 Single Speed")
    ]
    for name, sprockets, expected_name in test_cases:
        test_cassette = Cassette(name, sprockets)
        assert type(test_cassette.sprockets) == list
        assert type(test_cassette.name) == str
        assert test_cassette.name == expected_name
        assert str(test_cassette) == expected_name
        if isinstance(sprockets, str):
            sprocket_list = [int(x) for x in sprockets.split(',') if x]
        elif isinstance(sprockets, list):
            sprocket_list = [int(x) for x in sprockets] if sprockets else []
        elif isinstance(sprockets, int):
            sprocket_list = [sprockets]
        else:
            sprocket_list = []
        assert test_cassette.speed == len(sprocket_list)

    # Test ValueError for invalid sprockets input
    for test in ["", []]:
        with pytest.raises(ValueError):
            Cassette(None, test)

def test_crankset_functions():
    test_cases = [
        ("explicit_name", [11, 12, 13], "explicit_name"),
        (None, [11, 12, 13], "13/12/11"),
        (None, [42], "42"),
        (None, "11,12,13", "13/12/11"),
        (None, "42", "42"),
        (None, 42, "42")
    ]
    for name, rings, expected_name in test_cases:
        test_crankset = Crankset(name, rings)
        assert type(test_crankset.rings) == list
        assert type(test_crankset.name) == str
        assert test_crankset.name == expected_name
        assert str(test_crankset) == expected_name
        if isinstance(rings, str):
            rings_list = [int(x) for x in rings.split(',') if x]
        elif isinstance(rings, list):
            rings_list = [int(x) for x in rings] if rings else []
        elif isinstance(rings, int):
            rings_list = [rings]
        else:
            rings_list = []
        assert test_crankset.speed == len(rings_list)

    # Test ValueError for invalid rings input
    for test in ["", []]:
        with pytest.raises(ValueError):
            Crankset(None, test)


def test_tyre_functions():
    test_cases = [
        ("explicit_name", 2000, "explicit_name"),
        (None, 200, "<Tyre 200mm>"),
        (None, "200", "<Tyre 200mm>"),
        (None, None, "<Tyre>")
    ]
    for name, circumference, expected_name in test_cases:
        test_tyre = Tyre(name, circumference)
        assert type(test_tyre.name) == str
        if circumference is not None:
            assert type(test_tyre.circumference) == int
        assert test_tyre.name == expected_name
        assert str(test_tyre) == expected_name
