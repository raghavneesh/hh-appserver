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
    username : String,
    main_conference: Boolean,
    pre_conference: Boolean,
    learn_to_code: Boolean,
    teach_school_outreach: Boolean,
    teach_learn_to_code: Boolean
});

module.exports = mongoose.model('bookings',Booking);
