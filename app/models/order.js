var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
  user_id    : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  address_id  : {type: mongoose.Schema.Types.ObjectId, ref: 'Address'},
  custom_vitamin_ids: [{type: mongoose.Schema.Types.ObjectId, ref: 'Custom_vitamin'}],
  time_ordered : Date,
  price : Number,
  status : String //submitted, delivered
});

module.exports  = mongoose.model('Order', orderSchema);