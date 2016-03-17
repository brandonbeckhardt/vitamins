var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/vitamins';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('ALTER TABLE vitamins ADD price_per_unit real');
query.on('end', function() { client.end(); });