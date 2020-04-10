'use strict'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());

const handler = require('./modules/handler.js');
const client = require('./modules/client.js');
const locationHandler = require('./modules/location.js')
const weatherHandler = require('./modules/weather.js')

app.get('/', handler.homePageFunction)
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);
app.get('/movies', moviesHandler);
app.get('/yelp', yelpHandler);
app.use('*', handler.notFoundHandler);
app.use(handler.errorHandler);




function startServer() {
    app.listen(PORT, () => console.log(`Server up on ${PORT}`));
}

client
    .connect()
    .then(startServer)
    .catch(err => console.error(err));