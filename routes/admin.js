
var express = require('express');
var router = express.Router();
var Pickup = require('../models/Pickup');
var User = require('../models/User');
var Accommodation = require('../models/Accommodation');
var Booking = require('../models/Booking');
var Talk = require('../models/Talk');
var moment = require('moment');
var async = require('async');

router.get('/', function(req, res) {
	res.render('admin', { title: 'Admin' });
});

router.get('/pickups', function(req, res) {
	Pickup.find(function(err, pickups) {
		var newpickups = JSON.parse(JSON.stringify(pickups))
		var indexes = [];
		var i;
		for(i = 0; i < pickups.length; ++i ) {
			indexes.push(i);
		}
		///Is it the best way?	
		async.each(indexes,  function(i, callback) {
			User.findById(newpickups[i].user, function(err, user) {
				if(err)	{
					callback('Database read error');
				}	else	{
					newpickups[i].date = moment(pickups[i].date).format('DD-MM-YYYY');	
					newpickups[i].user =  {id : user._id, email:  user.email} ;	
					callback();
				}
		    });
		}, function(err){
		    if( err ) {
				console.log(err);
		    } else {
		      res.render('pickups', { title: 'Admin Pickups' , pickups: newpickups});  
		    }
		});
		
    });
});

router.get('/users/:id', function(req, res) {
	var id = req.param('id');
	User.findById(id, function(err, user) {
    	res.render('index', { title: user });
    });
});

router.get('/users', function(req, res) {
	User.find(function(err, users) {
		var newusers = JSON.parse(JSON.stringify(users))
		for(i=0; i < users.length; ++i)	{
			newusers[i].created_at = moment(users[i].created_at).format('YYYY-MM-DD HH:mm Z');	
			newusers[i].last_login = moment(users[i].last_login).format('YYYY-MM-DD HH:mm Z');	
		}
    	res.render('users', { title: 'Admin - User' , users: newusers});  
    });
});

router.get('/accommodation', function(req, res) {
	Accommodation.find(function(err, accommodation) {
    	res.render('accomodation', { title: 'Admin - Accommodation' , accommodation: accommodation});  
    });
});

router.get('/bookings', function(req, res) {
	Booking.find(function(err, bookings) {
		var newbookings = JSON.parse(JSON.stringify(bookings))
		for(i=0; i < bookings.length; ++i)	{
			newbookings[i].arrival_date = moment(bookings[i].arrival_date).format('DD-MM-YYYY');	
			newbookings[i].departure_date = moment(bookings[i].departure_date).format('DD-MM-YYYY');
		}
    	res.render('bookings', { title: 'Admin - Bookings' , bookings: newbookings});  
    });
});

router.get('/talks', function(req, res) {
	Talk.find(function(err, talks) {
		var newtalks = JSON.parse(JSON.stringify(talks))
		for(i=0; i < talks.length; ++i)	{
			newtalks[i].created_at = moment(talks[i].created_at).format('YYYY-MM-DD HH:mm Z');	
		}
    	res.render('talks', { title: 'Admin - Talks' , talks: newtalks});  
    });
   
});


module.exports = router;