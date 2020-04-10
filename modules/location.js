'use strict'


require('dotenv').config();
const client = require('./client.js');
const superagent = require('superagent');
const handler = require('./handler.js');

function locationHandler(request, response) {
    const city = request.query.city;
    getLocation(city)
        .then(data => handler.render(data, response))
        .catch((error) => handler.errorHandler(error, request, response));
}

function getLocation(city) {
    const SQL = 'SELECT * FROM locations WHERE search_query = $1';
    const valueSQL = [city];
    return client.query(SQL, valueSQL).then((results) => {

        if (results.rowCount) {
            console.log('hi');

            return results.rows[0];
        } else {
            console.log('hiiiiiii');
            const API_URL = (`https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`);
            return superagent.get(API_URL)
                .then(locData =>
                    cacheLocation(city, locData.body))


        }
    });

}

function cacheLocation(city, geoData) {

    const location = new Location(geoData[0]);
    let SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING * `;
    let safeValues = [city, location.formatted_query, location.latitude, location.longitude];
    return client.query(SQL, safeValues)
        .then(results => results.rows[0]);
}

function Location(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}

module.exports = locationHandler;