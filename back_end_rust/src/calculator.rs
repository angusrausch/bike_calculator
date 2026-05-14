pub fn calculate_ratios(crankset: &[u16], cassette: &[u16]) -> Vec<Vec<f64>> {
    let mut crankset_vec = crankset.to_vec();
    let mut cassette_vec = cassette.to_vec();

    crankset_vec.sort_unstable();
    crankset_vec.reverse();
    cassette_vec.sort_unstable();

    let mut ratios = Vec::new();
    for ring in crankset_vec.iter() {
        let mut temp_ratios = Vec::new();
        for sprocket in cassette_vec.iter() {
            let ratio = (*ring as f64) / (*sprocket as f64);
            temp_ratios.push(ratio);
        }
        ratios.push(temp_ratios);
    }
    ratios
}

pub fn calculate_rollout(crankset: &[u16], cassette: &[u16], tyre: &u16) -> Vec<Vec<f64>> {
    let ratios = calculate_ratios(crankset, cassette);

    let mut rollouts = Vec::new();

    for ring in ratios.iter() {
        let mut temp_rollouts: Vec<f64>  = Vec::new();
        for ratio in ring.iter() {
            let rollout: f64 = *ratio * *tyre as f64;
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
