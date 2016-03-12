var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/vitamins';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query("INSERT INTO vitamins (id,name, description, price_per_unit) VALUES "+
    "(1,'Vitamin A', 'Good for the soul', .01),"+
    "(2,'Vitamin B', 'Amazing', .02),"+
    "(3,'Vitamin C','So great', .015),"+
    "(4,'Vitamin D', 'Good for immune system of bones', .01);"+
	"INSERT INTO dosages (id,v_id, units, dose_range, times_per_day) VALUES "+
    "(1,1, 'mg', '100:1000', 1),"+
    "(2,2, 'mg', '120:1200', 1), "+
   	"(3,3, 'iu', '200:2000', 1), "+
   	"(4,4, 'mg', '100:1000', 1); "
	);

query.on('end', function() { client.end(); });

// INSERT INTO vitamins (name, description, price_per_unit) VALUES
// ('Vitamin A', 'Good for the soul', .01)
// ( 'Vitamin B', 'Amazing', .02)
// ('Vitamin C','So great', .015)
// ('Vitamin D', 'Good for immune system of bones', .01);
// INSERT INTO dosages (v_id, units, dose_range, times_per_day) VALUES 
// ( 1, 'mg', '100:1000' , 1),
//  2, 'mg', '120:1200' , 1),
// ( 3, 'iu', '200:2000' , 1),
//  (4, 'mg', '100:1000' , 1);