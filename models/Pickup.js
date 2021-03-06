var mongoose = require('mongoose'),
schema = mongoose.Schema,
utilities = require('../utils.js'),
//Define User schema
Pickup = new schema({
	user : 'ObjectId',
	date : Number,
	time : String,
	seats : Number,
	location : String,
        price: Number
});

Pickup.statics.isValidLocation = function(locationString){
	var locations = global.Event.locations;
	for(var i=0;i<locations.length;i++){
		if(locationString == locations[i].value)
			return true;
	}
	return false;
}
module.exports = mongoose.model('pickup',Pickup);
