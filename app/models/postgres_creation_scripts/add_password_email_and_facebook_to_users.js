var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/vitamins';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('ALTER TABLE users ADD password text, ADD email text, ADD facebook_id text, ADD facebook_token text;');

query.on('end', function() { client.end(); });