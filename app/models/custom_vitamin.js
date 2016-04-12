var mongoose = require('mongoose');

var customVitaminSchema = mongoose.Schema({
  order_id    : {type: mongoose.Schema.Types.ObjectId, ref: 'Order'}, //Only there once order is submitted
  user_id	:{type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  vitamin_id  : [{type: mongoose.Schema.Types.ObjectId, ref: 'Vitamin'}], //Array vitamin_ids
  dosage : [Number],
  price : Number,
  number_of_pills : Number,
  times_per_day : Number,
  status : String //cart, save_for_later, ordered
});

module.exports  = mongoose.model('Custom_vitamin', customVitaminSchema);