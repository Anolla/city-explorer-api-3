'use strict'
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
    response.send('THIS IS THE HOME PAGE');

});

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);
app.get('/movies', moviesHandler);
app.use('*', notfoundHandler);
app.use(errorHandler);


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (err) => {
    throw new Error(err);
});

function locationHandler(request, response) {

    const city = request.query.city;
    //get data from the DB
    const SQL = 'SELECT * FROM locations WHERE search_query = $1;';
    const safeValues = [city];
    client
        .query(SQL, safeValues)
        .then((results) => {
            console.log('hello');

            if (results.rows.length > 0) {
                response.status(200).json(results.rows[0]) //cause it will be an array of only one element and it will return an object
            } else {
                superagent(
                        `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`)
                    .then((res) => {
                        console.log('bye')
                        const geoData = res.body;
                        const locationData = new Location(city, geoData);
                        //get data from the query and insert it to the DB
                        const SQL = 'INSERT INTO locations (search_query, formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4) RETURNING *';
                        const safeValues = [locationData.search_query, locationData.formatted_query, locationData.latitude, locationData.longitude];
                        client.query(SQL, safeValues).then(results => {
                            response.status(200).json(results.rows[0]);
                        })
                    })
            }
        })
        .catch((error) => {
            errorHandler(error, request, response);
        })
}

function Location(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}


function weatherHandler(request, response) {

    superagent(
            `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`
        )
        .then((weatherRes) => {
            // console.log(weatherRes);
            const weatherSummaries = weatherRes.body.data.map((day) => {
                return new Weather(day);
            });
            response.status(200).json(weatherSummaries);
        })
        .catch((err) => errorHandler(err, request, response));
}

function Weather(day) {
    this.forecast = day.weather.description;
    this.time = new Date(day.valid_date).toString().slice(0, 15);
}

function trailsHandler(request, response) {
    superagent(`https://hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=400&key=${process.env.TRAIL_API_KEY}`)
        .then((trailRes) => {
            console.log(trailRes);
            const trailsInfo = trailRes.body.trails.map((element) => { return new Trail(element) });
            response.status(200).json(trailsInfo);
        })

    .catch((err) => errorHandler(err, request, response));
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
    this.condition_time = element.conditionDate.toString().slice(11, 8);

}

// {
//     "title": "Sleepless in Seattle",
//     "overview": "A young boy who tries to set his dad up on a date after the death of his mother. He calls into a radio station to talk about his dad’s loneliness which soon leads the dad into meeting a Journalist Annie who flies to Seattle to write a story about the boy and his dad. Yet Annie ends up with more than just a story in this popular romantic comedy.",
//     "average_votes": "6.60",
//     "total_votes": "881",
//     "image_url": "https://image.tmdb.org/t/p/w500/afkYP15OeUOD0tFEmj6VvejuOcz.jpg",
//     "popularity": "8.2340",
//     "released_on": "1993-06-24"
//   },
//   {
//     "title": "Love Happens",
//     "overview": "Dr. Burke Ryan is a successful self-help author and motivational speaker with a secret. While he helps thousands of people cope with tragedy and personal loss, he secretly is unable to overcome the death of his late wife. It's not until Burke meets a fiercely independent florist named Eloise that he is forced to face his past and overcome his demons.",
//     "average_votes": "5.80",
//     "total_votes": "282",
//     "image_url": "https://image.tmdb.org/t/p/w500/pN51u0l8oSEsxAYiHUzzbMrMXH7.jpg",
//     "popularity": "15.7500",
//     "released_on": "2009-09-18"
//   },

function moviesHandler(request, response) {
    superagent(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${request.query.city}`) // https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}
        .then((moviesRes) => {

            const moviesInfo = moviesRes.body.results.forEach((element) => { return new Movie(element) });
            response.status(200).json(moviesInfo);
        })

    .catch((err) => errorHandler(err, request, response));

}

function Movie(element) {
    this.title = element.original_title;
    this.overview = element.overview;
    this.average_votes = element.vote_average;
    this.total_votes = element.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500/${element.poster_path}`;
    this.popularity = element.popularity;
    this.released_on = element.release_date;
}



function errorHandler(error, request, response) {
    response.status(500).send(error);
}

function notfoundHandler(request, response) {
    response.status(404).send('ERROR 404 NOT FOUND');
}

client
    .connect()
    .then(() => {
        app.listen(PORT, () =>
            console.log(`my server is up and running on port ${PORT}`)
        );
    })
    .catch((err) => {
        throw new Error(`startup error ${err}`);
    });