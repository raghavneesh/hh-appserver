var express = require('express');
var router = express.Router();
var passport = require('passport'),
User = require('../models/User');

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
				error : 'Error while logging in'
			});
		} else 
			res.send(response);
		next();
	});
});

router.get('/verify',function(req, res, next){
	var code = req.query.code;
	if(!code || !(req.query.email || req.query.phone)){
		res.status(400);
		res.send({
			error : 'Bad request'
		});
		return;
	}
	//Verify user
	User.verify({
		email : req.query.email,
		phone : req.query.phone,
		code : code
	},function(error, user){
		if(error){
			res.status(500);
			res.send({
				error : 'Error occurred while verifying'
			});
			return;
		}
		if(!user){
			res.status(404);
			res.send({
				error : 'User not found'
			});
		} else{
			req.session.passport.user = user;

			res.send(user);
		}
	});

});

module.exports = router;
