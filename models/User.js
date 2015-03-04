var mongoose = require('mongoose'),
schema = mongoose.Schema,
utilities = require('../utils.js');
//Define User schema
User = new schema({
	email : 'String',
	phone : 'String',
	first_name : 'String',
	last_name : 'String',
	created_at : 'Number',
	last_login : 'Number',
	oauth : 'Mixed',
	isVerified : 'Boolean',
	verifier : 'String'
}),
UnverifiedUser = mongoose.model('user_unverified',User),
shortId = require('shortid');

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
		} else{
			done(err,user);
		}
	});
};
User.statics.authenticate = function(authenticationRequest,done){
	//TODO Validate email and phone
	var searchQuery = {};
    if(authenticationRequest.email)
        searchQuery.email = authenticationRequest.email;
    else if(req.body.phone)
        searchQuery.phone = authenticationRequest.phone;
    else{
    	res.status(400);
        res.send({
        	error : 'Bad request'
        });
        return;
    }
    //Check if user is already exists
    User.findOne(searchQuery,function(err, user){
        if(err){
            console.log('Error while loggin in : ' + err);
            done(err, 'Error while logging in');
            return;
        }
        if(!user){
        	//Save user
            User.add({
                email : authenticationRequest.email,
                phone : authenticationRequest.phone,
                first_name : authenticationRequest.firstname,
                last_name : authenticationRequest.lastname
            },function(error, user){
                if(error){
                	done(error)
                    return;
                }
                user.sendVerification();
                done(false,{
                	user : user,
                	needverfication : true
                });
            });
        } else{
        	//Login user
            user.sendVerification();
            done(false,{
                	user : user,
                	needverfication : true
            });
        }
    });
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
	var user = new User(profile);
	user.created_at = new Date().getTime();
	user.save(function(err){
		if(err){
			console.log('Error while saving user ', err);
			done(true,err);
			return;
		}
		done(null,user);
	});
};
User.methods.sendVerification = function(){
	this.isVerified = false;
	this.verifier = shortId.generate();
	this.save();
	if(this.email){
		//Send verification email
		utilities.sendHHEmail({
			subject : 'Hillhacks Verification',
			to : this.email,
			text : 'Verification code for hillhacks is ' + this.verifier
		});	
	}
	
}

User.statics.verify = function(verifyquery,done){
	//Check if email/phone exists with the verifier
	this.findOne({'$and':[{
		'$or' : [{
			email : verifyquery.email
		},{
			phone : verifyquery.phone
		}]
	},{
		verifier : verifyquery.code
	}]},function(error, user){
		if(error){
			done(error);
			return;
		}
		if(user){
			user.isVerified = true;
			user.verifier = undefined;
			user.save();
		}
		done(false,user);
	});
}


module.exports = mongoose.model('users',User);