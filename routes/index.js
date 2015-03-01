var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/auth/facebook/return',passport.authenticate('facebook',{
	successRedirect: '/',
	failureRedirect: '/'
}));
router.get('/login', passport.authenticate('facebook',{scope: 'email,public_profile'}));


module.exports = router;
