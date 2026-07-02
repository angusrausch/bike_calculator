const express = require('express');
const router = express.Router();
const { Crankset, Cassette, Tyre, } = require('../models/models');
const { calculateRatios, calculateRollouts, calculateSpeeds } = require('../calculator');

router.get('/api/cranksets', async (req, res) => {
    try {
        // OOP Data Fetching Method
        const data = await Crankset.findAll();

        res.json(data);
    } catch (error) {
        console.error("DATABASE ERROR:", error);
        res.status(500).json({ error: 'Failed to fetch cranksets' });
    }
});

router.get('/api/cassettes', async (req, res) => {
    try {
        const data = await Cassette.findAll();

        res.json(data);
    } catch (error) {
        console.error("DATABASE ERROR:", error);
        res.status(500).json({ error: 'Failed to fetch cassettes' });
    }
});

router.get('/api/tyres', async (req, res) => {
    try {
        const data = await Tyre.findAll();

        res.json(data);
    } catch (error) {
        console.error("DATABASE ERROR:", error);
        res.status(500).json({ error: 'Failed to fetch tyres' });
    }
});

function normalizeSprockets (value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(Number).filter(n => !Number.isNaN(n));
    if (typeof value === 'number') return [value];
    if (typeof value === 'string') {
        try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(Number).filter(n => !Number.isNaN(n));
        if (typeof parsed === 'number') return [parsed];
        } catch (e) {
        // not JSON, fallthrough to CSV
        }
        return value.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
    }
    if (typeof value === 'object') {
        return Object.values(value).map(Number).filter(n => !Number.isNaN(n));
    }
    return [];
}

async function findCassetteSprockets (req) {
    const { cassette_id, manual_cassette } = req.query;
    if (cassette_id == null || cassette_id == 0) {
        return normalizeSprockets(manual_cassette);
    } else {
        try {
            const data = await Cassette.findByPk(cassette_id);
            return data.sprockets
        } catch (error) {
            console.error("DATABASE ERROR:", error);
            // res.status(500).json({ error: 'Cassette not found' });
        }
    }
}

async function findChainrings (req) {
    const { crankset_id, manual_chainring } = req.query;
    if (crankset_id == null || crankset_id == 0) {
        return normalizeSprockets(manual_chainring);
    } else {
        try {
            const data = await Crankset.findByPk(crankset_id);
            return data.rings
        } catch (error) {
            console.error("DATABASE ERROR:", error);
            // res.status(500).json({ error: 'Cassette not found' });
        }
    }
}

router.get('/api/calculate/ratio', async (req, res) => {
    try {
        const sprockets = await findCassetteSprockets(req);
        const rings = await findChainrings(req);
        console.log(rings)
        const ratios = calculateRatios(rings, sprockets);
        
        res.json({
            "chainrings": rings,
            "sprockets": sprockets,
            "results": ratios
        });
    } catch (error) {
        console.error(error);
    }

})

module.exports = router;