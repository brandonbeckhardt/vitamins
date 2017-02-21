var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
  user_id    : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  address_id  : {type: mongoose.Schema.Types.ObjectId, ref: 'Address'},
  custom_vitamin_id: {type: mongoose.Schema.Types.ObjectId, ref 'Custum_vitamin'},
  time_ordered : Timestamp,
  price : Double,
  status : String, //submitted, delivered
  name: String
});

module.exports  = mongoose.model('Order', orderSchema);