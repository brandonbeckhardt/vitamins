var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/vitamins';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE vitamins(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, description VARCHAR(40))');
query.on('end', function() { client.end(); });
