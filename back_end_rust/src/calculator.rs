pub fn calculate_ratios(mut crankset: &[u16], mut cassette: &[u16]) -> Vec<Vec<f32>> {
    let mut crankset_vec = crankset.to_vec();
    let mut cassette_vec = cassette.to_vec();

    crankset_vec.sort_unstable();
    crankset_vec.reverse();
    cassette_vec.sort_unstable();

    let mut ratios = Vec::new();
    for ring in crankset_vec.iter() {
        let mut temp_ratios = Vec::new();
        for sprocket in cassette_vec.iter() {
            let ratio = (*ring as f32) / (*sprocket as f32);
            temp_ratios.push(ratio);
        }
        ratios.push(temp_ratios);
    }
    ratios
}

pub fn calculate_rollout(crankset: &[u16], cassette: &[u16], tyre: &u16) -> Vec<Vec<f32>> {
    let ratios = calculate_ratios(crankset, cassette);

    let mut rollouts = Vec::new();

    for ring in ratios.iter() {
        let mut temp_rollouts: Vec<f32>  = Vec::new();
        for ratio in ring.iter() {
            let rollout: f32 = *ratio * *tyre as f32;
            temp_rollouts.push(rollout);
        }
        rollouts.push(temp_rollouts);
    }
    rollouts
}

pub fn calculate_speed(crankset: &[u16], cassette: &[u16], tyre: &u16, cadence_list: &[u16]) -> Vec<Vec<f64>> {
    let rollouts = calculate_rollout(crankset, cassette, tyre);

    let mut speeds = Vec::new();

    for rollout_group in rollouts.iter() {
        for rollout in rollout_group.iter() {
            let mut temp_speeds = Vec::new();
            for cadence in cadence_list.iter() {
                let speed: f64 = *rollout as f64 * *cadence as f64 / 16670 as f64;
                temp_speeds.push(speed);
            }
            speeds.push(temp_speeds);
        }
    }
    speeds
}

#[cfg(test)]
mod test {
    use super::*;

    const TEST_CRANKSET: [u16; 2] = [50, 100];
    const TEST_CASSETTE: [u16; 5] = [10, 20, 30, 40, 50];
    const TEST_TYRE: u16 = 1000;
    const TEST_CADENCE: [u16; 3] = [50, 75, 100];

    const EXPECTED_RATIO_RESULT: [[f32; 5]; 2] = [
        [10.0, 5.0, 3.3333333, 2.5, 2.0],
        [5.0, 2.5, 1.6666667, 1.25, 1.0],
    ];
    const EXPECTED_ROLLOUT_RESULT: [[f32; 5]; 2] = [
        [10000.0, 5000.0, 3333.3333333, 2500.0, 2000.0],
        [5000.0, 2500.0, 1666.6666667, 1250.0, 1000.0],
    ];
    const EXPECTED_SPEED_RESULT: [[f64; 3]; 10] = [
        [29.99400119976005, 44.991001799640074, 59.9880023995201],
		[14.997000599880025, 22.495500899820037, 29.99400119976005],
		[9.99800015582821, 14.997000233742314, 19.99600031165642],
		[7.498500299940012, 11.247750449910018, 14.997000599880025],
		[5.9988002399520095, 8.998200359928015, 11.997600479904019],
		[14.997000599880025, 22.495500899820037, 29.99400119976005],
		[7.498500299940012, 11.247750449910018, 14.997000599880025],
		[4.999000077914105, 7.498500116871157, 9.99800015582821],
		[3.749250149970006, 5.623875224955009, 7.498500299940012],
		[2.9994001199760048, 4.499100179964008, 5.9988002399520095],
    ];

    #[test]
    fn test_calculate_ratios() {
        let result = calculate_ratios(&TEST_CRANKSET, &TEST_CASSETTE);
        assert!(result.len() == 2, "Incorrect length in the crankset level of array");
        assert!(result[0].len() == 5, "Incorrect length in the cassette level of array");
        
        let epsilon = 1e-6; // Tolerance

        for i in 0..2 {
            for j in 0..5 {
                let diff = (result[i][j] - EXPECTED_RATIO_RESULT[i][j]).abs();
                assert!(diff < epsilon, "Ratio at [{}][{}] was too far off! Found {} expected {}", i, j, result[i][j], EXPECTED_RATIO_RESULT[i][j]);
            }
        }
    }

    #[test]
    fn test_calculate_rollout() {
        let result = calculate_rollout(&TEST_CRANKSET, &TEST_CASSETTE, &TEST_TYRE);
        assert!(result.len() == 2, "Incorrect length in the crankset level of array");
        assert!(result[0].len() == 5, "Incorrect length in the cassette level of array");
        
        let epsilon = 1e-6; // Tolerance

        for i in 0..2 {
            for j in 0..5 {
                let diff = (result[i][j] - EXPECTED_ROLLOUT_RESULT[i][j]).abs();
                assert!(diff < epsilon, "Rollout at [{}][{}] was too far off! Found {} expected {}", i, j, result[i][j], EXPECTED_ROLLOUT_RESULT[i][j]);
            }
        }
    }

    #[test]
    fn test_calculate_speed() {
        let result = calculate_speed(&TEST_CRANKSET, &TEST_CASSETTE, &TEST_TYRE, &TEST_CADENCE);
        assert!(result.len() == 10, "Incorrect length in the gear ratio level of array");
        assert!(result[0].len() == 3, "Incorrect length in the cadence level of array");
        
        let epsilon = 1e-6; // Tolerance

        for i in 0..10 {
            for j in 0..3 {
                let diff = (result[i][j] - EXPECTED_SPEED_RESULT[i][j]).abs();
                assert!(diff < epsilon, "Speed at [{}][{}] was too far off! Found {} expected {}", i, j, result[i][j], EXPECTED_SPEED_RESULT[i][j]);
            }
        }    }
}