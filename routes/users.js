var express = require('express');
var router = express.Router(),
async = require('async'),
moment = require('moment'),
utilities = require('../utils.js'),
Booking = require('../models/Booking'),
Talk = require('../models/Talk'),
Accommodation = require('../models/Accommodation');

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



router.post('/talk/add', global.isAuthenticated, function(req, res){
	if(req.body.talks){
		try{
			var talks = JSON.parse(req.body.talks),
			userId = req.user._id;
			return res.send('OK');
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
	if(!req.body.date || !utilities.isValidDate(req.body.date, 'DD-MM-yyyy') || !Accommodation.isValidType(req.body.type)){
		res.status(400);
		return res.json({
			error : 'Invalid request'
		});
	}
	var user = req.user;
	Accommodation.findOne({
		user : user._id
	},function(error, accommodation){
		if(error){
			return next(error);
		}
		if(!accommodation)
			accommodation = new Accommodation();
		accommodation.type = req.body.type;
		accommodation.startDate = moment(req.body.date, 'DD-MM-yyyy').valueOf();
		accommodation.days = parseInt(req.body.days || '1', 10);
		accommodation.beds = parseInt(req.body.beds || '1', 10);
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

module.exports = router;
