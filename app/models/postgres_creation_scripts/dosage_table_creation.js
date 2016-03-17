// // Connection to database
// pgp = require('pg-promise')(/*options*/);
// var db = pgp("postgres:///vitamins");

// db.query('CREATE TABLE dosages(id SERIAL PRIMARY KEY, FOREIGN KEY v_id REFERENCES vitamins, units VARCHAR(40) not null, dose_range VARCHAR(40)), times_per_day INT)');

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/vitamins';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE dosages(id SERIAL PRIMARY KEY, v_id INT REFERENCES vitamins(id), units VARCHAR(40) not null, dose_range VARCHAR(40), times_per_day INT)');
query.on('end', function() { client.end(); });
