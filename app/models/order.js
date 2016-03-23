var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
  user_id    : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  address_id  : {type: mongoose.Schema.Types.ObjectId, ref: 'Address'},
  time_ordered : Timestamp,
  price : Double,
  status : String //submitted, delivered
});

module.exports  = mongoose.model('Order', orderSchema);