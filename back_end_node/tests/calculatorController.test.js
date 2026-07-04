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
