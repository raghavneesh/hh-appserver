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
	talk : Boolean
});

module.exports = mongoose.model('bookings',Booking);