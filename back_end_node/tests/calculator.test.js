const { calculateRatios, calculateRollouts, calculateSpeeds } = require('../calculator');

describe('Test Calculations', () => {
    chainringSize = [52,36]
    cassetteSize = [11,12,13,14,15,16,17,19,21,24,27,30]
    tyreSize = 2128

    simplifiedChainringSize = [100, 50]
    simplifiedCassetteSize = [25, 50]
    simplifiedTyreSize = 100

    cadenceList = [70, 80, 90, 100]

    simplifiedRatioResult = [
        [4, 2],
        [2, 1]
    ]

    simplifiedRolloutResult = [
        [400, 200],
        [200, 100]
    ]

    simplifiedSpeedResult = [
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

    describe('Ratios', () => {
        it('should be the expected size of the crankset and cassette combo', () => {
            const results = calculateRatios(chainringSize, cassetteSize);
            expect(results.length).toBe(chainringSize.length);
            expect(results[0].length).toBe(cassetteSize.length);
        });

        it('should return expected values for crankset and cassette combo', () => {
            const results = calculateRatios(simplifiedChainringSize, simplifiedCassetteSize);
            expect(results).toEqual(simplifiedRatioResult);
        });
    });

    describe('Rollouts', () => {
        it('should be the expected size of the crankset, cassette and tyre combo', () => {
            const results = calculateRollouts(chainringSize, cassetteSize, tyreSize);
            expect(results.length).toBe(chainringSize.length);
            expect(results[0].length).toBe(cassetteSize.length);
        });

        it('should return expected values for crankset, cassette and tyre combo', () => {
            const results = calculateRollouts(simplifiedChainringSize, simplifiedCassetteSize, simplifiedTyreSize);
            expect(results).toEqual(simplifiedRolloutResult);
        });
    });

    describe('Speeds', () => {
        it('should be the expected size of the crankset, cassette, tyre and cadence combo', () => {
            const results = calculateSpeeds(chainringSize, cassetteSize, tyreSize, cadenceList);
            expect(results.length).toBe(chainringSize.length * cassetteSize.length);
            expect(results[0].length).toBe(cadenceList.length);
        });

        it('should return expected values for crankset, cassette, tyre and cadence combo', () => {
            const results = calculateSpeeds(simplifiedChainringSize, simplifiedCassetteSize, simplifiedTyreSize, cadenceList);
            expect(results).toEqual(simplifiedSpeedResult);
        });
    });
});