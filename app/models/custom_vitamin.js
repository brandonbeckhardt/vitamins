var mongoose = require('mongoose');

var customVitaminSchema = mongoose.Schema({
  user_id	:{type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  vitamin_id  : [{type: mongoose.Schema.Types.ObjectId, ref: 'Vitamin'}], //Array vitamin_ids
  dosage : [Number],
  number_of_pills : Number,
  times_per_day : Number,
  status : String //cart, save_for_later
});

module.exports  = mongoose.model('Custom_vitamin', customVitaminSchema);