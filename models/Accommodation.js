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

Accommodation.methods.find = function(done){
	this.find({},function(err, result) {
		if(err)
			done(err, null);
		else
			done(null, result);
	});
}

module.exports = mongoose.model('accommodation',Accommodation);
