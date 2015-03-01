var mongoose = require('mongoose'),
schema = mongoose.Schema,
//Define User schema
User = new schema({
	id	: 'String',
	name : 'String',
	email : 'String',
	first_name : 'String',
	last_name : 'String',
	gender : 'String',
	link : 'String',
	created_at : 'Number',
	last_login : 'Number',
	oauth : 'Mixed'
}),
//Create application user from passport standard profile object
getUserFromOauthProfile = function(profile){
	var user = {
		oauth : {}
	},
	name = profile.name;

	if(profile.emails && profile.emails.length)
		user.email = profile.emails[0].value;
	else //If there is no email, return nothing
		return;
	if(name){
		user.first_name = name.givenName;
		user.last_name = name.familyName;
	}
	user.oauth[profile.provider] = {
		id : profile.id
	};
	return user;
	
};


User.statics.oAuthLogin = function(profile,done){
	if(!profile || !profile.id || !profile.provider){
		done('Could not find OAuth user profile.');
		return;
	};
	var _this = this,
	searchQuery = {};
	searchQuery['oauth.' + profile.provider + '.id'] = profile.id;
	//Search whether user already exists
	//TODO also check for Email
	_this.findOne(searchQuery,function(err,user){ 
		if(err){
			//TODO Needs a logger
			console.log(err);
			done('Error while looking for user in db.');
			return;
		}
		if(!user){
			user = getUserFromOauthProfile(profile);
			//Add user to the system
			_this.add(user,done);
		} else
			done(err,user);
	});
};
User.statics.login = function(){

};
/*
* Check and add user to the system
*/
User.statics.add = function(profile,done){
	if(!profile){
		done('Could not find user profile.');
		return;
	}
	var _this = this;
	profile.created_at = new Date().getTime();
	_this.create(profile)
    .then(function(user){
    	console.log(user);
        done(false, user);
    });
};
User.statics.isExists = function(userId){

};


module.exports = mongoose.model('users',User);