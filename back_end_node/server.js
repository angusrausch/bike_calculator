const express = require('express');
const app = express();

const calculatorRoutes = require('./routes/calculator');

app.use('/', calculatorRoutes);

const port = process.env.SERVER_PORT || 8080;

app.listen(port, () => {

})