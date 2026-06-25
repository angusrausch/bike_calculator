process.env.NODE_ENV = 'test';
const { sequelize, Cassette, Crankset, Tyre } = require('../models/models');

describe('Models Tests', () => {
    beforeAll(async () => {
        await sequelize.sync();
    });

    afterAll(async () => {
        await Cassette.destroy({ where: {} });
        await Crankset.destroy({ where: {} });
        await Tyre.destroy({ where: {} });
        await sequelize.close();
    });

    describe('Test Cassette Functions', () => {
        const testCases = [
            ['explicit_name', [11, 12, 13], 'explicit_name'],
            [null, [11, 12, 13], '11-13 (3 Speed)'],
            [null, [15], '15 Single Speed'],
            [null, '11,12,13', '11-13 (3 Speed)'],
            [null, '15', '15 Single Speed'],
            [null, 15, '15 Single Speed']
        ];

        test('Correct cassette values are set', async () => {
            for (const [name, sprockets, expectedName] of testCases) {
                const testCassette = new Cassette(name, sprockets);
                await testCassette.save();

                expect(Array.isArray(testCassette.sprockets)).toBe(true);
                expect(testCassette.speed).toBe(testCassette.sprockets.length);
                expect(testCassette.name).toBe(expectedName);
            }
        });

        test('Invalid cassette fails', async () => {
            for (const test of ['', []]) {
                expect(() => new Cassette(null, test)).toThrow('Sprockets cannot be empty string or empty list');
            }
        });
    });

    describe('Test Crankset Functions', () => {
        const testCases = [
            ["explicit_name", [11, 12, 13], "explicit_name"],
            [null, [11, 12, 13], "13/12/11"],
            [null, [42], "42"],
            [null, "11,12,13", "13/12/11"],
            [null, "42", "42"],
            [null, 42, "42"]
        ];

        test('Correct crankset values are set', async () => {
            for (const [name, rings, expectedName] of testCases) {
                const testCrankset = new Crankset(name, rings);
                await testCrankset.save();

                expect(Array.isArray(testCrankset.rings)).toBe(true);
                expect(testCrankset.speed).toBe(testCrankset.rings.length);
                expect(testCrankset.name).toBe(expectedName);
            }
        });

        test('Invalid crankset fails', async () => {
            for (const test of ['', []]) {
                expect(() => new Crankset(null, test)).toThrow('Rings cannot be empty string or empty list');
            }
        });
    });

    describe('Test Tyre Functions', () => {
        const testCases = [
            ["explicit_name", 2000, "explicit_name"],
            [null, 200, "<Tyre 200mm>"],
            [null, "200", "<Tyre 200mm>"],
            [null, null, "<Tyre>"]
        ];

        test('Correct tyre values are set', async () => {
            for (const [name, circumference, expectedName] of testCases) {
                const testTyre = new Tyre(name, circumference);
                await testTyre.save();

                expect(testTyre.name).toBe(expectedName);
                expect(testTyre.circumference).toBe(circumference)
            }
        });
    });
});