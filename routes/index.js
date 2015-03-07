var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/User'),
Token = require('../models/Token'),
utilities = require('../utils.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/auth/facebook/return',passport.authenticate('facebook',{
	successRedirect: '/',
	failureRedirect: '/'
}));
router.get('/login', passport.authenticate('facebook',{scope: 'email,public_profile'}));

router.post('/authenticate',function(req,res,next){
	//Check if email and phone exists in request
	if(!req.body.email && !req.body.phone){
		res.status(400);
		res.send({
			error : 'Bad request'
		});
		return;
	}
	User.authenticate(req.body,function(error, response){
		if(error){
			res.status(500);
			res.send({
				error : error
			});
		} else 
			res.send(response);
	});
});


router.get('/verify',function(req, res, next){
	passport.authenticate('local',function(err, user, info){
		if(err){
			return res.send({
				error : err
			});
		}
		 req.logIn(user,function(err){
		 	if(err){
		 		return next(err);
		 	}
		 	var token = utilities.randomString(64);
		    Token.save(token, req.user._id, function(err) {
		      if (err) { return next(err); }
		      res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
		      res.json(user);
		    });
		 });
		
	})(req, res, next);
});


module.exports = router;
