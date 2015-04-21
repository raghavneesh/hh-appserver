var express = require('express');
var router = express.Router(),
async = require('async'),
moment = require('moment'),
utilities = require('../utils.js'),
Booking = require('../models/Booking'),
Talk = require('../models/Talk'),
Accommodation = require('../models/Accommodation'),
Pickup = require('../models/Pickup'),
ObjectId = require('mongoose').Types.ObjectId;

/* GET users listing. */
router.get('/', global.isAuthenticated, function(req, res) {
  res.send('respond with a resource');
});

/* Reserve dates for single user */
router.post('/reservedates', global.isAuthenticated ,function(req, res){
	var datesString = req.body.dates,
	eventStartDate = Event.startDate, //Event start Date
	eventEndDate = Event.endDate, //Event end date
	accommodation = !!req.body.accommodation,
	pickup = !!req.body.pickup,
	user = req.user,
	arrivalDate = moment(req.body.arrival_date,'DD-MM-yyyy'),
	departureDate = moment(req.body.departure_date,'DD-MM-yyyy');

	if(!utilities.isEventDate(arrivalDate) || !utilities.isEventDate(departureDate)){
		res.status(400);
		return res.json({
			error : 'Not valid dates'
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
		booking.arrival_date = arrivalDate.valueOf();
		booking.departure_date = departureDate.valueOf();
		/*booking.dates = eventDates; //set dates*/
		booking.accommodation = !!(accommodation); //Set accommodation as boolean
		booking.pickup = !!(pickup); //Set pickup as boolean
		booking.talk = !!req.body.talk;
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



router.post('/talk/add', global.isAuthenticated, function(req, res){
	if(req.body.talks){
		try{
			var talks = req.body.talks,
			userId = req.user._id;
			if(!talks.length || !talks.splice){
				throw 500;
			}
			//Save talks
			async.mapSeries(talks,function(talkRequest, indCallback){
				var talk = new Talk();
				talk.saveTalk(talkRequest, userId, function(error, talk){
					//If there is some error, 
					//send this particular task with error message
					if(error){
						talk = {
							error : error
						};
					}
					indCallback(false, talk);
				});
			},function(error, results){
				if(error){
					res.status(500);
					return res.json({
						error : error
					});
				}
				res.json(results);
			});

		} catch(err){
			res.status(500);
			return res.json({
				error : 'Invalid talks request json'
			});
		}
	} else {
		res.status(400);
		return res.json({
			error : 'Invalid request'
		});
	}
});
router.get('/talk/:id', function(req, res){
	var talkId = req.params.id;
	if(!ObjectId.isValid(talkId)){
		return res.json({
			error : 'Invalid Id'
		});
	}
	Talk.findOne({
		_id : talkId
	},function(error, talk){
		if(error){
			return res.json({
				error : error
			});
		}
		if(!talk){
			res.status(404);
			return res.json({
				error : 'Talk not found'
			});
		}
		res.json(talk);
	});
});

router.post('/talk/edit/:id', global.isAuthenticated, function(req, res){
	var talkId = req.params.id;
	if(!ObjectId.isValid(talkId)){
		return res.json({
			error : 'Invalid Id'
		});
	}
	Talk.findOne({
		_id : talkId
	},function(error, talk){
		if(error){
			return res.json({
				error : error
			});
		}
		if(!talk){
			res.status(404);
			return res.json({
				error : 'Talk not found'
			});
		}
		talk.saveTalk(req.body, req.user._id, function(error, updatedTalk){
			if(error){
				res.status(500);
				return res.json({
					error : error
				});
			}
			res.json(updatedTalk);
		});
	});
});

router.get('/talk/delete/:id',global.isAuthenticated, function(req, res){
	var talkId = req.params.id;
	if(!ObjectId.isValid(talkId)){
		return res.json({
			error : 'Invalid Id'
		});
	}
	Talk.findOne({
		_id : talkId
	},function(error, talk){
		if(error){
			return res.json({
				error : error
			});
		}
		if(!talk){
			res.status(404);
			return res.json({
				error : 'Talk not found'
			});
		}
		talk.remove();
		res.json({
			deleted : true
		});
	});
});

router.post('/accommodation',global.isAuthenticated,function(req, res){
	/*if(!req.body.date || !utilities.isValidDate(req.body.date, 'DD-MM-yyyy') || !Accommodation.isValidType(req.body.type)){
		res.status(400);
		return res.json({
			error : 'Invalid request'
		});
	}*/
	var user = req.user;
	Accommodation.findOne({
		user : user._id
	},function(error, accommodation){
		if(error){
			return next(error);
		}
		if(!accommodation)
			accommodation = new Accommodation();
		accommodation.tent = !!req.body.tent;
		accommodation.sleeping_bag = !!req.body.sleeping_bag;
		accommodation.mat = !!req.body.mat;
		accommodation.pillow = !!req.body.pillow;
		accommodation.family = !!req.body.family;
		accommodation.family_details = req.body.family_details;
		/*accommodation.type = req.body.type;
		accommodation.startDate = moment(req.body.date, 'DD-MM-yyyy').valueOf();
		accommodation.days = req.body.days || 1;
		accommodation.beds = req.body.beds || 1;
		accommodation.description = req.body.description;
		accommodation.family = !!req.body.family;*/
		accommodation.user = user._id;
		accommodation.save();
		return res.json(accommodation);
	});
});

router.get('/accommodation',global.isAuthenticated,function(req, res){
	var user = req.user;
	Accommodation.findOne({
		user : user._id
	},function(error, accommodation){
		if(error)
			return next(error);
		if(!accommodation){
			res.status(404);
			return res.json({
				error : 'Accommodation not found'
			});
		}
		return res.json(accommodation);
	});
});

router.post('/pickup',global.isAuthenticated,function(req, res){
	if(!req.body.date || !utilities.isValidDate(req.body.date, 'DD-MM-yyyy')){
		res.status(400);
		return res.json({
			error : 'Invalid request'
		});
	}
	var user = req.user;
	Pickup.findOne({
		user : user._id
	},function(error, pickup){
	        var location_string = "";
		if(error){
			return next(error);
		}
		if(!pickup)
			pickup = new Pickup();
		pickup.date = moment(req.body.date, 'DD-MM-yyyy').valueOf();
		pickup.time = req.body.time;
		pickup.seats = parseInt(req.body.seats || '1', 10);
	        location_string = req.body.location.toString().split("\n");
		pickup.location = location_string[0];
		pickup.user = user._id;
		pickup.save();
		return res.json(pickup);
	});
});

router.get('/pickup',global.isAuthenticated,function(req, res){
	var user = req.user;
	Pickup.findOne({
		user : user._id
	},function(error, pickup){
		if(error)
			return next(error);
		if(!pickup){
			res.status(404);
			return res.json({
				error : 'Pickup not found'
			});
		}
		return res.json(pickup);
	});
});

module.exports = router;
