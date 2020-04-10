'use strict'

require('dotenv').config();
const superagent = require('superagent');
const handler = require('./handler.js');
module.exports = weatherHandler;


function weatherHandler(request, response) {
    getWeather(day)
        .then(data => handler.render(data, response))
        .catch((error) => handler.errorHandler(error, request, response))
}

function getWeather(city) {
    const city = request.query.search_query
    const api_url = (`https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}`);
    return superagent.get(api_url).then(weatherInfo =>
        weatherData(weatherInfo.body.data)
    );

}

function weatherData(day) {
    return day.map(element => {
        return new Weather(element)

    })
}

function Weather(day) {
    this.forecast = day.weather.description;
    this.time = new Date(day.valid_date).toString().slice(0, 15);
}

module.exports = weatherHandler;