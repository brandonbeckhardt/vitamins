var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
  user_id    : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  custom_vitamin_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Custom_vitamin'},
  status : String //cart, save_for_later
});

module.exports  = mongoose.model('Cart_Item', orderSchema);