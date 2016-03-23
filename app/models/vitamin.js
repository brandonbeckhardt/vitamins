var mongoose = require('mongoose');

var vitaminSchema = mongoose.Schema({
  name    : String,
  description  : String,
  price_per_unit : Number,
  dose_range : [Number],
  times_per_day : Number,
  units : String
});

module.exports  = mongoose.model('Vitamin', vitaminSchema);