var mongoose = require('mongoose');


 // id | user_id |       street        | state | zip_code |   city   |    country 
var addressSchema = mongoose.Schema({
  user_id    : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  street  : String,
  state : String,
  zip_code : Number,
  city : String,
  country : String
});

module.exports  = mongoose.model('Address', addressSchema);