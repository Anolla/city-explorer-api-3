'use strict'

function render(data, response) {
    response.status(200).json(data);
}

function errorHandler(error, request, response) {
    response.status(500).send(error);
}

function notFoundHandler(request, response) {
    response.status(404).send('ERROR 404 NOT FOUND');
}

function homePageFunction(request, response) {
    response.send('THIS IS THE HOME PAGE');
}


module.exports = {
    errorHandler: errorHandler,
    notFoundHandler: notFoundHandler,
    render: render,
    homePageFunction: homePageFunction
}