require('../vitamin');

var Vitamin  = require('mongoose').model('Vitamin');

var newVitamin = new Vitamin();
newVitamin.name = "Vitamin A";
newVitamin.description = "Good for you!";
newVitamin.price_per_unit = .3;
newVitamin.dose_range = [100,200,300];
newVitamin.times_per_day = 2;
newVitamin.units = "mg";

newVitamin.save(function(err, newVitamin){
	console.log('here');
	if (err) throw err;
	console.log('Saved!');
});


