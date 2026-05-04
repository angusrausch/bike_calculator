import pytest

from bikecalc.calculator import calculate_ratios, calculate_rollouts, calculate_speeds

chainring_size = [52,36]
cassette_size = [11,12,13,14,15,16,17,19,21,24,27,30]
tyre_size = 2128

simplified_chainring_size = [100, 50]
simplified_cassette_size = [25, 50]
simplified_tyre_size = 100

cadence_list = [70, 80, 90, 100]

simplified_ratio_result = [
    [4, 2],
    [2, 1]
]

simplified_rollout_result = [
    [400, 200],
    [200, 100]
]

simplified_speed_result = [
    [
        1.6796640671865626,
        1.919616076784643,
        2.1595680863827234,
        2.3995200959808036
    ],
    [
        0.8398320335932813,
        0.9598080383923215,
        1.0797840431913617,
        1.1997600479904018
    ],
    [
        0.8398320335932813,
        0.9598080383923215,
        1.0797840431913617,
        1.1997600479904018
    ],
    [
        0.41991601679664065,
        0.47990401919616077,
        0.5398920215956808,
        0.5998800239952009
    ]
]

def test_calculate_ratios():
    # Test the length is correct
    result = calculate_ratios(chainring_size, cassette_size)
    assert len(result) == len(chainring_size)
    assert len(result[0]) == len(cassette_size)

    # Test the value is correct
    result = calculate_ratios(simplified_chainring_size, simplified_cassette_size)
    assert result == simplified_ratio_result

def test_calculate_rollout():
    # Test the length is correct
    result = calculate_rollouts(chainring_size, cassette_size, tyre_size)
    assert len(result) == len(chainring_size)
    assert len(result[0]) == len(cassette_size)

    # Test the value is correct
    result = calculate_rollouts(simplified_chainring_size, simplified_cassette_size, simplified_tyre_size)
    assert result == simplified_rollout_result

def test_calculate_speeds():
    # Test the length is correct
    result = calculate_speeds(chainring_size, cassette_size, tyre_size, cadence_list)
    assert len(result) == len(chainring_size) * len(cassette_size)
    assert len(result[0]) == len(cadence_list)

    # # Test the value is correct
    result = calculate_speeds(simplified_chainring_size, simplified_cassette_size, simplified_tyre_size, cadence_list)
    assert result == simplified_speed_result
