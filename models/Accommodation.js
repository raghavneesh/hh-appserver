var mongoose = require('mongoose'),
schema = mongoose.Schema,
utilities = require('../utils.js'),
//Define User schema
Accommodation = new schema({
	user : 'ObjectId',
	type : 'String',
	tent : Boolean,
	sleeping_bag : Boolean,
	mat : Boolean,
	pillow : Boolean,
	family : Boolean,
	family_details : String
});

Accommodation.statics.isValidType = function(accommodationStr){
	return (accommodationStr && (global.Event.accommodation.types.indexOf(accommodationStr) != -1));
}
module.exports = mongoose.model('accommodation',Accommodation);