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

function normalizeSprockets(value) {
    if (value === undefined || value === null || String(value).trim() === '') {
        throw new TypeError();
    }

    const decoded = decodeURIComponent(String(value));
    
    return decoded.split(',').map(segment => {
        const trimmed = segment.trim();
        
        if (trimmed === '') throw new TypeError();
        
        const num = Number(trimmed);
        
        if (Number.isNaN(num)) throw new TypeError();
        
        return num;
    });
}

async function findCassetteSprockets (req) {
    const { cassette_id, manual_cassette } = req.query;
    if (cassette_id == null || cassette_id == 0) {
        try {
            return normalizeSprockets(manual_cassette);
        } catch (error) {
            throw new TypeError("Invalid Manual Cassette")
        }
    } else if (Number.isInteger(Number(cassette_id))) {
        const data = await Cassette.findByPk(cassette_id);
        if (data == null) {
            throw new ReferenceError("Cassette not found");
        }
        return data.sprockets;
    } else {
        throw new TypeError("Invalid Cassette ID");
    }
}

async function findChainrings (req) {
    const { crankset_id, manual_chainring } = req.query;
    if (crankset_id == null || crankset_id == 0) {
        try {
            return normalizeSprockets(manual_chainring);
        } catch (error) {
            throw new TypeError("Invalid Manual Crankset")
        }
    } else if (Number.isInteger(Number(crankset_id))) {
        const data = await Crankset.findByPk(crankset_id);
        if (data == null) {
            throw new ReferenceError("Crankset not found");
        }
        return data.rings
    } else {
        throw new TypeError("Invalid Crankset ID");
    }
}

async function findTyre (req) {
    const { tyre_id } = req.query;
    if (tyre_id == null) {
        throw new TypeError("Tyre ID not provided")
    } else if (Number.isInteger(Number(tyre_id))) {
        const data = await Tyre.findByPk(tyre_id);
        if (data == null) {
            throw new ReferenceError("Tyre not found");
        }
        return data.circumference
    } else {
        throw new TypeError("Invalid Tyre ID");
    }
}

router.get('/api/calculate/ratio', async (req, res) => {
    try {
        const rings = await findChainrings(req);
        const sprockets = await findCassetteSprockets(req);
        const ratios = calculateRatios(rings, sprockets);

        res.json({
            "chainrings": rings,
            "sprockets": sprockets,
            "results": ratios
        });
    } catch (error) {
        if (error instanceof ReferenceError) {
            res.status(404).json({ error: error.message });
        } else if (error instanceof TypeError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
})

router.get('/api/calculate/rollout', async (req, res) => {
    try {
        const rings = await findChainrings(req);
        const sprockets = await findCassetteSprockets(req);
        const circumference = await findTyre(req);
        const rollout = calculateRollouts(rings, sprockets, circumference);

        res.json({
            "chainrings": rings,
            "sprockets": sprockets,
            "circumference": circumference,
            "results": rollout
        });
    } catch (error) {
        if (error instanceof ReferenceError) {
            res.status(404).json({ error: error.message });
        } else if (error instanceof TypeError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
})

module.exports = router;