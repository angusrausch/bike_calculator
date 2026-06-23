const express = require('express');
const router = express.Router();
const { Crankset, Cassette, Tyre } = require('../models/models');

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

module.exports = router;