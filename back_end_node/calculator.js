function calculateRatios(crankset, cassette) {
    var gearRatios = [];
    
    const sortedCrankset = [...crankset].sort((a, b) => b - a);
    const sortedCassette = [...cassette].sort((a, b) => a - b);

    for (const chainring of sortedCrankset) {
        var tempRatios = [];
        for (const sprocket of sortedCassette) {
            const ratio = Number((chainring / sprocket).toFixed(2));
            tempRatios.push(ratio);
        }
        gearRatios.push(tempRatios);
    }
    return gearRatios;
}

function calculateRollout(crankset, cassette, tyre) {
    ratios = calculateRatios(crankset, cassette);
    rollouts = [];
    for (chainring of ratios) {
        tempRollouts = [];
        for (ratio of chainring) {
            const rollout = Number((ratio * tyre).toFixed(2));
            tempRollouts.push(rollout);
        }
        rollouts.push(tempRollouts);
    }
    return rollouts;
}

function calculateSpeeds(crankset, cassette, tyre, cadences) {
    rollouts = calculateRollout(crankset, cassette, tyre);
    speeds = [];
    for (rolloutGroup of rollouts) {
        for (rollout of rolloutGroup) {
            speedGroup = [];
            for (cadence of cadences) {
                const speed = Number(rollout * cadence / 16670);
                speedGroup.push(speed);
            }
            speeds.push(speedGroup);
        }
    }
    return speeds;
}

module.exports = { calculateRatios, calculateRollout, calculateSpeeds };