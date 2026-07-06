process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../server');
const { sequelize, Cassette, Crankset, Tyre } = require('../models/models');
const { calculateRatios, calculateRollouts, calculateSpeeds } = require('../calculator');

describe('Get API Endpoints Test', () => {
    describe('GET /api/cassettes', () => {
        it('should return a list of cassettes with a 200 status code', async () => {
            const response = await request(app).get('/api/cassettes');
            expect(response.statusCode).toBe(200);

            const data = response.body;
            expect(Array.isArray(data)).toBe(true);
            expect(data[0] == data[1]).toBe(false);
            
            const firstElement = data[0];
            expect(firstElement).toHaveProperty('name');
            expect(firstElement).toHaveProperty('sprockets');
            expect(Array.isArray(firstElement['sprockets'])).toBe(true);
        });
    });

    describe('GET /api/cranksets', () => {
        it('should return a list of cranksets with a 200 status code', async () => {
            const response = await request(app).get('/api/cranksets');
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);

            const data = response.body;
            expect(Array.isArray(data)).toBe(true);
            expect(data[0] == data[1]).toBe(false);
            
            const firstElement = data[0];
            expect(firstElement).toHaveProperty('name');
            expect(firstElement).toHaveProperty('rings');
            expect(Array.isArray(firstElement['rings'])).toBe(true);
        });
    });

    describe('GET /api/tyres', () => {
        it('should return a list of tyres with a 200 status code', async () => {
            const response = await request(app).get('/api/tyres');
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);

            const data = response.body;
            expect(Array.isArray(data)).toBe(true);
            expect(data[0] == data[1]).toBe(false);
            
            const firstElement = data[0];
            expect(firstElement).toHaveProperty('name');
            expect(firstElement).toHaveProperty('circumference');
        });
    });

    describe('get /api/calculate/ratios', () => {
        const basePath = "/api/calculate/ratio";

        describe("Valid inputs", () => {
            it("tests a number of valid requests to check response", async () => {
                const options = [
                    [1,1], [2,1], [2,2]
                ];
                for (option of options) {
                    const params = `crankset_id=${option[0]}&cassette_id=${option[1]}`;
                    const full_path = basePath + "?" + params;
                    const expectedChainrings = (await Crankset.findByPk(option[0])).rings;
                    const expectedCassette = (await Cassette.findByPk(option[1])).sprockets;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(200);
                    const data = response.body;

                    expect(data.chainrings).toEqual(expectedChainrings);
                    expect(data.sprockets).toEqual(expectedCassette);

                    const expectedRatios = calculateRatios(expectedChainrings, expectedCassette);
                    expect(data.results).toEqual(expectedRatios);
                }
            });

            it("tests a number of valid manual inputs to check response", async () => {
                const paramsOptions = [
                    [["52%2C36", "11%2C12%2C13"], [[52,36], [11,12,13]]],
                    [["52,36", "11,12,13"], [[52,36], [11,12,13]]]
                ];
                for (option of paramsOptions) {
                    const encodedParams = option[0];
                    const expectedParams = option[1];
                    const params = `manual_chainring=${encodedParams[0]}&manual_cassette=${encodedParams[1]}`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(200);
                    const data = response.body;

                    expect(data.chainrings).toEqual(expectedParams[0]);
                    expect(data.sprockets).toEqual(expectedParams[1]);

                    const expectedRatios = calculateRatios(expectedParams[0], expectedParams[1]);
                    expect(data.results).toEqual(expectedRatios);
                }
            });
        });

        describe("invalid inputs", () => {
            it("tests not found ids to check response", async () => {
                const options = [
                    [999, 1, "Crankset not found"],
                    [1, 999, "Cassette not found"],
                    [-1, 1, "Crankset not found"],
                    [1, -1, "Cassette not found"],
                ];
                for (option of options) {
                    const params = `crankset_id=${option[0]}&cassette_id=${option[1]}`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(404);
                    const data = response.body;

                    expect(data.error).toEqual(option[2]);
                }
            })

            it("tests invalid ids to check response", async () => {
                const options = [
                    ["a", 1, "Invalid Crankset ID"],
                    [1, "a", "Invalid Cassette ID"],
                    [null, 1, "Invalid Crankset ID"],
                    [1, null, "Invalid Cassette ID"],
                ];
                for (option of options) {
                    const params = `crankset_id=${option[0]}&cassette_id=${option[1]}`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(400);
                    const data = response.body;

                    expect(data.error).toEqual(option[2]);
                }
            })

            it("tests invalid manual inputs to check response", async () => {
                const options = [
                    [["1a,12", "11,12"], "Invalid Manual Crankset"],
                    [["11,12", "1a,12"], "Invalid Manual Cassette"],
                    [["", "11,12"], "Invalid Manual Crankset"],
                    [["11,12",""], "Invalid Manual Cassette"],
                    [[",", "11,12"], "Invalid Manual Crankset"],
                    [["11,12",","], "Invalid Manual Cassette"]
                ];
                for (option of options) {
                    const encodedParams = option[0];
                    const expectedParams = option[1];
                    const params = `manual_chainring=${encodedParams[0]}&manual_cassette=${encodedParams[1]}`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(400);
                    const data = response.body;

                    expect(data.error).toEqual(option[1]);
                }
            })
        });
    });

    describe('get /api/calculate/rollout', () => {
        const basePath = "/api/calculate/rollout";

        describe("Valid inputs", () => {
            it("tests a number of valid requests to check response", async () => {
                const options = [
                    [1,1,1], [2,1,1], [2,2,1], [2,2,2]
                ];
                for (option of options) {
                    const params = `crankset_id=${option[0]}&cassette_id=${option[1]}&tyre_id=${option[2]}`;
                    const full_path = basePath + "?" + params;

                    const expectedChainrings = (await Crankset.findByPk(option[0])).rings;
                    const expectedCassette = (await Cassette.findByPk(option[1])).sprockets;
                    const expectedTyre = (await Tyre.findByPk(option[2])).circumference;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(200);
                    const data = response.body;

                    expect(data.chainrings).toEqual(expectedChainrings);
                    expect(data.sprockets).toEqual(expectedCassette);
                    expect(data.circumference).toEqual(expectedTyre);

                    const expectedRatios = calculateRollouts(expectedChainrings, expectedCassette, expectedTyre);
                    expect(data.results).toEqual(expectedRatios);
                }
            });

            it("tests a number of valid manual inputs to check response", async () => {
                const paramsOptions = [
                    [["52%2C36", "11%2C12%2C13"], [[52,36], [11,12,13]]],
                    [["52,36", "11,12,13"], [[52,36], [11,12,13]]]
                ];
                for (option of paramsOptions) {
                    const encodedParams = option[0];
                    const expectedParams = option[1];
                    const params = `manual_chainring=${encodedParams[0]}&manual_cassette=${encodedParams[1]}&tyre_id=1`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);

                    expect(response.statusCode).toBe(200);
                    const data = response.body;

                    expect(data.chainrings).toEqual(expectedParams[0]);
                    expect(data.sprockets).toEqual(expectedParams[1]);
                    const expectedTyre = (await Tyre.findByPk(1)).circumference;
                    expect(data.circumference).toEqual(expectedTyre);
                    
                    const expectedRatios = calculateRollouts(expectedParams[0], expectedParams[1], expectedTyre);
                    expect(data.results).toEqual(expectedRatios);
                }
            });
        });

        describe("invalid inputs", () => {
            it("tests not found ids to check response", async () => {
                const options = [
                    [999, 1, 1, "Crankset not found"],
                    [1, 999, 1, "Cassette not found"],
                    [1, 1, 999, "Tyre not found"],
                    [-1, 1, 1, "Crankset not found"],
                    [1, -1, 1, "Cassette not found"],
                    [1, 1, -1, "Tyre not found"],
                ];
                for (option of options) {
                    const params = `crankset_id=${option[0]}&cassette_id=${option[1]}&tyre_id=${option[2]}`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(404);
                    const data = response.body;

                    expect(data.error).toEqual(option[3]);
                }
            })

            it("tests invalid ids to check response", async () => {
                const options = [
                    ["a", 1, 1, "Invalid Crankset ID"],
                    [1, "a", 1, "Invalid Cassette ID"],
                    [1, 1, "a", "Invalid Tyre ID"],
                    [null, 1, 1, "Invalid Crankset ID"],
                    [1, null, 1, "Invalid Cassette ID"],
                    [1, 1, null, "Invalid Tyre ID"],
                ];
                for (option of options) {
                    const params = `crankset_id=${option[0]}&cassette_id=${option[1]}&tyre_id=${option[2]}`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(400);
                    const data = response.body;

                    expect(data.error).toEqual(option[3]);
                }
            })

            it("tests invalid manual inputs to check response", async () => {
                const options = [
                    [["1a,12", "11,12"], "Invalid Manual Crankset"],
                    [["11,12", "1a,12"], "Invalid Manual Cassette"],
                    [["", "11,12"], "Invalid Manual Crankset"],
                    [["11,12",""], "Invalid Manual Cassette"],
                    [[",", "11,12"], "Invalid Manual Crankset"],
                    [["11,12",","], "Invalid Manual Cassette"]
                ];
                for (option of options) {
                    const encodedParams = option[0];
                    const expectedParams = option[1];
                    const params = `manual_chainring=${encodedParams[0]}&manual_cassette=${encodedParams[1]}&tyre_id=1`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(400);
                    const data = response.body;

                    expect(data.error).toEqual(option[1]);
                }
            })

            it("tests response when no tyre id is provided", async () => {
                const params = `cassette_id=1&crankset_id=1`;
                const full_path = basePath + "?" + params;

                const response = await request(app).get(full_path);
                expect(response.statusCode).toBe(400);
                const data = response.body;

                expect(data.error).toEqual("Tyre ID not provided");
            })
        });
    });

    describe('get /api/calculate/speed', () => {
        const basePath = "/api/calculate/speed";

        describe("Valid inputs", () => {
            it("tests a number of valid requests to check response", async () => {
                const options = [
                    [1,1,1,60,100,10], [2,1,1,70,110,30], [2,2,1,70,110,30], [2,2,2,70,110,30]
                ];
                for (option of options) {
                    const params = `crankset_id=${option[0]}&cassette_id=${option[1]}&tyre_id=${option[2]}&min_cadence=${option[3]}&max_cadence=${option[4]}&cadence_increment=${option[5]}`;
                    const full_path = basePath + "?" + params;

                    const expectedChainrings = (await Crankset.findByPk(option[0])).rings;
                    const expectedCassette = (await Cassette.findByPk(option[1])).sprockets;
                    const expectedTyre = (await Tyre.findByPk(option[2])).circumference;
                    const minCadence = option[3];
                    const maxCadence = option[4];
                    const cadenceIncrement = option[5]
                    var cadenceList = [];
                    for (var cadence = minCadence; cadence <= maxCadence; cadence += cadenceIncrement) {
                        cadenceList.push(cadence);
                    }

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(200);
                    const data = response.body;

                    expect(data.chainrings).toEqual(expectedChainrings);
                    expect(data.sprockets).toEqual(expectedCassette);
                    expect(data.circumference).toEqual(expectedTyre);
                    expect(data.cadences).toEqual(cadenceList);

                    const expectedSpeed = calculateSpeeds(expectedChainrings, expectedCassette, expectedTyre, cadenceList);
                    expect(data.results).toEqual(expectedSpeed);
                }
            });

            it("tests a number of valid manual inputs to check response", async () => {
                const paramsOptions = [
                    [["52%2C36", "11%2C12%2C13"], [[52,36], [11,12,13]]],
                    [["52,36", "11,12,13"], [[52,36], [11,12,13]]]
                ];
                const cadenceParams = "min_cadence=50&max_cadence=100&cadence_increment=10";
                const cadenceList = [50,60,70,80,90,100];
                for (option of paramsOptions) {
                    const encodedParams = option[0];
                    const expectedParams = option[1];
                    const params = `manual_chainring=${encodedParams[0]}&manual_cassette=${encodedParams[1]}&tyre_id=1`;
                    const full_path = basePath + "?" + params + "&" + cadenceParams;

                    const response = await request(app).get(full_path);

                    expect(response.statusCode).toBe(200);
                    const data = response.body;

                    expect(data.chainrings).toEqual(expectedParams[0]);
                    expect(data.sprockets).toEqual(expectedParams[1]);
                    const expectedTyre = (await Tyre.findByPk(1)).circumference;
                    expect(data.circumference).toEqual(expectedTyre);
                    expect(data.cadences).toEqual(cadenceList);

                    const expectedSpeed = calculateSpeeds(expectedParams[0], expectedParams[1], expectedTyre, cadenceList);
                    expect(data.results).toEqual(expectedSpeed);
                }
            });

            it("tests cadence defaults are applied", async () => {
                paramOptions = [
                    ["","120","10"],
                    ["60","","10"], 
                    ["60","120",""],
                    ["", "", ""]
                ];

                const cadenceList = [60,70,80,90,100,110,120];
                const baseParams = "crankset_id=1&cassette_id=1&tyre_id=1";
                for (option of paramOptions) {
                    const params = `min_cadence=${option[0]}&max_cadence=${option[1]}&cadence_increment=${option[2]}`; 
                    const fullPath = basePath + "?" + baseParams + "&" + params;

                    const response = await request(app).get(fullPath);

                    expect(response.statusCode).toBe(200);
                    const data = response.body;

                    expect(data.cadences).toEqual(cadenceList)
                }
            });
        });

        describe("invalid inputs", () => {
            it("tests not found ids to check response", async () => {
                const options = [
                    [999, 1, 1, "Crankset not found"],
                    [1, 999, 1, "Cassette not found"],
                    [1, 1, 999, "Tyre not found"],
                    [-1, 1, 1, "Crankset not found"],
                    [1, -1, 1, "Cassette not found"],
                    [1, 1, -1, "Tyre not found"],
                ];
                for (option of options) {
                    const params = `crankset_id=${option[0]}&cassette_id=${option[1]}&tyre_id=${option[2]}`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(404);
                    const data = response.body;

                    expect(data.error).toEqual(option[3]);
                }
            });

            it("tests invalid ids to check response", async () => {
                const options = [
                    ["a", 1, 1, "Invalid Crankset ID"],
                    [1, "a", 1, "Invalid Cassette ID"],
                    [1, 1, "a", "Invalid Tyre ID"],
                    [null, 1, 1, "Invalid Crankset ID"],
                    [1, null, 1, "Invalid Cassette ID"],
                    [1, 1, null, "Invalid Tyre ID"],
                ];
                for (option of options) {
                    const params = `crankset_id=${option[0]}&cassette_id=${option[1]}&tyre_id=${option[2]}`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(400);
                    const data = response.body;

                    expect(data.error).toEqual(option[3]);
                }
            });

            it("tests invalid manual inputs to check response", async () => {
                const options = [
                    [["1a,12", "11,12"], "Invalid Manual Crankset"],
                    [["11,12", "1a,12"], "Invalid Manual Cassette"],
                    [["", "11,12"], "Invalid Manual Crankset"],
                    [["11,12",""], "Invalid Manual Cassette"],
                    [[",", "11,12"], "Invalid Manual Crankset"],
                    [["11,12",","], "Invalid Manual Cassette"]
                ];
                for (option of options) {
                    const encodedParams = option[0];
                    const expectedParams = option[1];
                    const params = `manual_chainring=${encodedParams[0]}&manual_cassette=${encodedParams[1]}&tyre_id=1`;
                    const full_path = basePath + "?" + params;

                    const response = await request(app).get(full_path);
                    expect(response.statusCode).toBe(400);
                    const data = response.body;

                    expect(data.error).toEqual(option[1]);
                }
            });

            it("tests response when no tyre id is provided", async () => {
                const params = `cassette_id=1&crankset_id=1`;
                const full_path = basePath + "?" + params;

                const response = await request(app).get(full_path);
                expect(response.statusCode).toBe(400);
                const data = response.body;

                expect(data.error).toEqual("Tyre ID not provided");
            });

            it("test response with invalid cadences", async () => {
                const baseParams = "crankset_id=1&cassette_id=1&tyre_id=1"
                paramsOptions = [
                    [["6a","120","10"], "Invalid minimum cadence"],
                    [["60","12a","10"], "Invalid maximum cadence"], 
                    [["60","120","1a"], "Invalid cadence increment"],
                    [["120","60","10"], "min_cadence cannot be greater than max_cadence"],
                    [["60","120","0"], "cadence_increment must be greater than 0"],
                ];

                for (option of paramsOptions) {
                    const params = `min_cadence=${option[0][0]}&max_cadence=${option[0][1]}&cadence_increment=${option[0][2]}`; 
                    const fullPath = basePath + "?" + baseParams + "&" + params;

                    const response = await request(app).get(fullPath);
                    expect(response.statusCode).toBe(400);
                    const data = response.body;

                    expect(data.error).toBe(option[1]);
                }
            });
        });
    });
})

afterAll(async () => {
    await Cassette.destroy({ where: {} });
    await Crankset.destroy({ where: {} });
    await Tyre.destroy({ where: {} });
    await sequelize.close();
});

beforeAll(async () => {
    await sequelize.sync();

    await Cassette.create({ name: 'Test Cassette 1', sprockets: '11,12,13,14,15,16,17,19,21,24,27,30' });
    await Cassette.create({ name: 'Test Cassette 2', sprockets: '12,14,16,18,21,24,28' });
    await Cassette.create({ name: 'Test Cassette 3', sprockets: '10,12,14,17,19,21,23,25' });

    await Crankset.create({ name: 'Test Crankset 1', rings: '52,36' });
    await Crankset.create({ name: 'Test Crankset 2', rings: '50,34' });
    await Crankset.create({ name: 'Test Crankset 3', rings: '53,39' });

    await Tyre.create({ name: 'Test Tyre 1', circumference: 2128 });
    await Tyre.create({ name: 'Test Tyre 2', circumference: 2100 });
    await Tyre.create({ name: 'Test Tyre 3', circumference: 2000 });
});
