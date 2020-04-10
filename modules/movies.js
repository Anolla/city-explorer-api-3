'use strict'


require('dotenv').config();
const client = require('./client.js');
const superagent = require('superagent');
const handler = require('./handler.js');

function moviesHandler(request, response) {
    getMovie(movie)
        .then(data => handler.render(data, response))
        .catch((err) => handler.errorHandler(err, request, response))
}

function getMovie(city) {
    const city = request.query.search_query
    superagent(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&query=${request.query.search_query}`)
    return superagent.get(api_url).then(movieInfo =>
        movieData(movieInfo.body.data)
    );

}

function movieData(data) {
    return data.map(element => {
        return new Movie(element)
    })
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

module.exports = moviesHandler;