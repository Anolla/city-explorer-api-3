'use strict'


module.exports = yelpHandler;
require('dotenv').config();
const superagent = require('superagent');
const handler = require('./handler.js');

function yelpHandler(request, response) {
    getYelp(res)
        .then(data => handler.render(data, response))
        .catch((err) => handler.errorHandler(err, request, response))
}

function getYelp(city) {
    const city = request.query.search_query
    const api_url = (`https://api.yelp.com/v3/businesses/search?location=${city}`).set({
            "Authorization": `Bearer ${process.env.YELP_API_KEY}`)
        .then(yelpInfo =>
            yelpData(yelpInfo.businesses.data)
        )
    }

    function yelpData(res) {
        return res.map(element => {
            return new Yelp(element)
        })
    }

    function Yelp(element) {
        this.name = element.name;
        this.image_url = element.url;
        this.price = element.price;
        this.rating = element.rating;
        this.url = element.url;
    }