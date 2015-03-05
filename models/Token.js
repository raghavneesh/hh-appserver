var mongoose = require('mongoose'),
schema = mongoose.Schema,
utilities = require('../utils.js'),
//Define User schema
Token = new schema({
	token : 'String',
	uid : 'String'
}),
User = require('./User');

Token.statics.consume = function(token,done){
	this.findOne({
		'token': token
	},function(err, token){
		if(err){
			return done(err);
		}
		if(token && token.uid){
			User.findById(token.uid, done);
		} else {
			return done(null);
		}
		token.remove();
	});
}
Token.statics.save = function(token, uid, done){
	var _this = this;
	var newToken = new _this();
	newToken.token = token;
	newToken.uid = uid;
	newToken.save(done);
}


module.exports = mongoose.model('tokens',Token);