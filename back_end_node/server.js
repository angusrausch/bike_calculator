const express = require('express');
const app = express();

const calculatorRoutes = require('./routes/calculatorRoutes');

app.use('/', calculatorRoutes);

const port = process.env.SERVER_PORT || 8080;

if (require.main === module) {
	app.listen(port, () => {});
}

module.exports = app;