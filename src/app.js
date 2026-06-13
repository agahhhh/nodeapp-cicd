const express = require('express');
const path = require('path');
const healthRouter = require('./routes/health');
 
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));
 
app.use('/health', healthRouter);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

module.exports = app;
