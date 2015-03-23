var express = require('express');
var router = express.Router(),
async = require('async'),
utilities = require('../utils.js'),
Booking = require('../models/Booking'),
Talk = require('../models/Talk');

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

module.exports = router;
