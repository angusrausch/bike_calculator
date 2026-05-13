use approx::assert_relative_eq;
use bike_calculator_backend::calculator::{*};

const TEST_CRANKSET: [u16; 2] = [50, 100];
const TEST_CASSETTE: [u16; 5] = [10, 20, 30, 40, 50];
const TEST_TYRE: u16 = 1000;
const TEST_CADENCE: [u16; 3] = [50, 75, 100];

const EXPECTED_RATIO_RESULT: [[f64; 5]; 2] = [
    [10.0, 5.0, 3.3333333, 2.5, 2.0],
    [5.0, 2.5, 1.6666667, 1.25, 1.0],
];
const EXPECTED_ROLLOUT_RESULT: [[f64; 5]; 2] = [
    [10000.0, 5000.0, 3333.3333333, 2500.0, 2000.0],
    [5000.0, 2500.0, 1666.6666667, 1250.0, 1000.0],
];
const EXPECTED_SPEED_RESULT: [[f64; 3]; 10] = [
    [29.99400119976005, 44.991001799640074, 59.9880023995201],
    [14.997000599880025, 22.495500899820037, 29.99400119976005],
    [9.998000399920016, 14.997000599880025, 19.996000799840033],
    [7.498500299940012, 11.247750449910018, 14.997000599880025],
    [5.9988002399520095, 8.998200359928015, 11.997600479904019],
    [14.997000599880025, 22.495500899820037, 29.99400119976005],
    [7.498500299940012, 11.247750449910018, 14.997000599880025],
    [4.999000199960008, 7.498500299940012, 9.998000399920016],
    [3.749250149970006, 5.623875224955009, 7.498500299940012],
    [2.9994001199760048, 4.499100179964008, 5.9988002399520095],
];

#[test]
fn test_calculate_ratios() {
    let result = calculate_ratios(&TEST_CRANKSET, &TEST_CASSETTE);
    assert!(result.len() == 2, "Incorrect length in the crankset level of array");
    assert!(result[0].len() == 5, "Incorrect length in the cassette level of array");
    
    for (result_row, expected_row) in result.iter().zip(EXPECTED_RATIO_RESULT.iter()) {
        for (result_val, expected_val) in result_row.iter().zip(expected_row.iter()) {
            assert_relative_eq!(*result_val as f64, *expected_val, epsilon = 1e-6f64);
        }
    }
}

#[test]
fn test_calculate_rollout() {
    let result = calculate_rollout(&TEST_CRANKSET, &TEST_CASSETTE, &TEST_TYRE);
    assert!(result.len() == 2, "Incorrect length in the crankset level of array");
    assert!(result[0].len() == 5, "Incorrect length in the cassette level of array");

    for (result_row, expected_row) in result.iter().zip(EXPECTED_ROLLOUT_RESULT.iter()) {
        for (result_val, expected_val) in result_row.iter().zip(expected_row.iter()) {
            assert_relative_eq!(*result_val as f64, *expected_val, epsilon = 1e-6f64);
        }
    }
}

#[test]
fn test_calculate_speed() {
    let result = calculate_speed(&TEST_CRANKSET, &TEST_CASSETTE, &TEST_TYRE, &TEST_CADENCE);
    assert!(result.len() == 10, "Incorrect length in the gear ratio level of array");
    assert!(result[0].len() == 3, "Incorrect length in the cadence level of array");

    for (result_row, expected_row) in result.iter().zip(EXPECTED_SPEED_RESULT.iter()) {
        for (result_val, expected_val) in result_row.iter().zip(expected_row.iter()) {
            assert_relative_eq!(*result_val, *expected_val, epsilon = 1e-8f64);
        }
    }
}
