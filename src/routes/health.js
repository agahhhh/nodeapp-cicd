const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.NODE_VERSION || '1.0.0'
    });
});

module.exports = router;
