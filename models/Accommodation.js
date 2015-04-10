var mongoose = require('mongoose'),
schema = mongoose.Schema,
utilities = require('../utils.js'),
//Define User schema
Accommodation = new schema({
	user : 'ObjectId',
	type : 'String',
	startDate : Number,
	days : Number,
	beds : Number
});

Accommodation.statics.isValidType = function(accommodationStr){
	return (accommodationStr && (global.Event.accommodation.types.indexOf(accommodationStr) != -1));
}
module.exports = mongoose.model('accommodation',Accommodation);