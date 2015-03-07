var mongoose = require('mongoose'),
schema = mongoose.Schema,
moment = require('moment'),
utilities = require('../utils.js'),
TALK_TYPES = ['workshop','talk','classroom'],
//Define User schema
Talk = new schema({
	user : 'ObjectId',
	title : String,
	description : String,
	date : Number,
	duration : String,
	type : String,
	location : {
		name : String,
		lat : Number,
		lng : Number
	},
	created_at : Number,
	updated_at : Number
});

/*
* Update user talk
*/
Talk.methods.saveTalk = function(talkInfo,userId,done){
	if(!talkInfo)
		return done('No sufficient information.');
	var _this = this;
	if(talkInfo.title)
		_this.title = talkInfo.title;
	_this.description = talkInfo.description;

	var dateTime = moment(talkInfo.datetime,'DD-MM-YYYY HH:mm');
	if(dateTime.isValid())
		_this.date = dateTime.valueOf();
	else
		return done('Date is not valid');
	_this.duration = talkInfo.duration;
	//Check types of talk
	if(TALK_TYPES.indexOf(talkInfo.type) > -1)
		_this.type = talkInfo.type;
	else if(talkInfo.type) //if info has type of talk but not validated
		return done('Not a valid type.');

	var location = utilities.getLocation(talkInfo.location);
	if(location){
		_this.location = location;
	}
	if(!_this.created_at)
		_this.created_at = new Date().getTime();
	else
		_this.updated_at = new Date().getTime();
	_this.user = userId;
	_this.save(function(error){
		if(error)
			return done('Error while saving talk for user ' + userId);
		done(false, _this);
	});
}

module.exports = mongoose.model('talks',Talk);