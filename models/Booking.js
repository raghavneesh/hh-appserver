var mongoose = require('mongoose'),
schema = mongoose.Schema,
utilities = require('../utils.js'),
//Define User schema
Booking = new schema({
	user : 'ObjectId',
	accommodation : Boolean,
	pickup : Boolean,
	dates : [Number]
});

module.exports = mongoose.model('bookings',Booking);