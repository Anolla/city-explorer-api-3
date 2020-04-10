'use strict'


require('dotenv').config();
const client = require('./client.js');
const superagent = require('superagent');
const handler = require('./handler.js');

function trailsHandler(request, response) {
    getTrails(res)
        .then(data => handler.render(data, response))
        .catch((error) => handler.errorHandler(error, request, response))
}

function getTrails() {

    const api_url = (`https://hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=400&key=${process.env.TRAIL_API_KEY}`);
    return superagent.get(api_url).then(trailsInfo =>
        trailData(trailsInfo.body.data)
    );
}

function trailData(data) {
    return data.map(element => {
        return new Trail(element)
    })
}


function Trail(element) {
    this.name = element.name;
    this.location = element.location;
    this.length = element.length;
    this.stars = element.stars;
    this.star_votes = element.starVotes;
    this.summary = element.conditionDetails;
    this.trail_url = element.url;
    this.conditions = element.conditionStatus;
    this.condition_date = element.conditionDate.toString().slice(0, 9);
    this.condition_time = element.conditionDate.toString().slice(11);

}

module.exports = trailsHandler;