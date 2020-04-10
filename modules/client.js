'use strict';

const pg = require('pg');
require('dotenv').config();

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

module.exports = client;