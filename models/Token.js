var mongoose = require('mongoose'),
schema = mongoose.Schema,
utilities = require('../utils.js'),
moment = require('moment'),
//Define User schema
Token = new schema({
	token : 'String',
	uid : 'String',
	created_at : Number,
	accessed_at : Number
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
};

Token.statics.getUser = function(token, done){
	this.findOne({
		'token': token
	},function(err, token){
		if(err){
			return done(err);
		}
		if(token.isExpired()){
			return done('Token has expired');
		}
		token.findUser(done);
		token.accessed_at = new Date().getTime();
		token.save();
	});
};

Token.statics.save = function(token, uid, done){
	var _this = this;
	var newToken = new _this();
	newToken.token = token;
	newToken.uid = uid;
	newToken.created_at = newToken.accessed_at = new Date().getTime();
	newToken.save(done);
};
Token.methods.findUser = function(done){
	var token = this;
	if(token && token.uid){
		User.findById(token.uid, done);
	} else {
		return done(null);
	}
}
Token.methods.isExpired = function(){
	var token = this,
	accessDate = moment(token.accessed_at || token.created_at),
	expiredDate = accessDate.add(8, 'days');
	return (moment().valueOf() > expiredDate.valueOf());
}

module.exports = mongoose.model('tokens',Token);