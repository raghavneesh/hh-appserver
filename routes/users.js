var express = require('express');
var router = express.Router(),
utilities = require('../utils.js'),
Booking = require('../models/Booking');

/* GET users listing. */
router.get('/', global.isAuthenticated, function(req, res) {
  res.send('respond with a resource');
});

/* Reserve dates for single user */
router.post('/reservedates', global.isAuthenticated ,function(req, res){
	var datesString = req.body.dates,
	eventStartDate = Event.startDate, //Event start Date
	eventEndDate = Event.endDate, //Event end date
	accommodation = parseInt(req.body.accommodation || '0',10),
	pickup = parseInt(req.body.pickup || '0',10),
	user = req.user,
	eventDates = utilities.getEventAcceptableDates(datesString);
	if(!eventDates || !eventDates.length){
		res.status(400);
		return res.json({
			error : 'Invalid request'
		});
	}
	Booking.findOne({
		user : req.user._id
	},function(error, booking){
		if(error){
			return next(error);
		}
		if(!booking)
			booking = new Booking(); //Create new booking

		booking.dates = eventDates; //set dates
		booking.accommodation = !!(accommodation); //Set accommodation as boolean
		booking.pickup = !!(pickup); //Set pickup as boolean
		booking.user = user._id; //Set user id
		booking.save(); //Saves
		res.json(booking);
	});
	
});

router.get('/reservedates',global.isAuthenticated, function(req, res){
	var user = req.user;
	Booking.findOne({
		user : user._id
	},function(error, booking){
		if(error){
			return next(error);
		}
		if(!booking){
			res.status(404);
			return res.json({
				error : 'No booking found'
			});
		}
		res.json(booking);
	});
});

module.exports = router;
