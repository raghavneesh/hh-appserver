var mongoose = require('mongoose'),
schema = mongoose.Schema,
utilities = require('../utils.js'),
//Define User schema
Booking = new schema({
	user : 'ObjectId',
	accommodation : Boolean,
	pickup : Boolean,
	arrival_date : Number,
	departure_date : Number,
	talk : Boolean,
	username : String
});

Booking.methods.find = function(done){
	this.find({},function(err, result) {
		if(err)
			done(err, null);
		else
			done(null, result);
	});
}

module.exports = mongoose.model('bookings',Booking);