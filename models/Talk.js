var mongoose = require('mongoose'),
schema = mongoose.Schema,
moment = require('moment'),
utilities = require('../utils.js'),
//Define User schema
Talk = new schema({
	user : 'ObjectId',
	title : String,
	description : String,
	date : Number,
	duration : String,
	type : String,
	event : String,
	notes : String,
	location : {
		name : String,
		lat : Number,
		lng : Number
	},
	hasCoPresenters : Boolean,
	needsProjector : Boolean,
	needsTools : Boolean,
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
	_this.notes = talkInfo.notes;
	_this.type = talkInfo.type;	
	_this.event = talkInfo.event;
	_this.duration = talkInfo.duration;
	_this.hasCoPresenters = !!talkInfo.hasCoPresenters;
	_this.needsProjector = !!talkInfo.needsProjector;
	_this.needsTools = !!talkInfo.needsTools;
	/*var dateTime = moment(talkInfo.datetime,'YYYY-MM-DD HH:mm');
	if(dateTime.isValid() && utilities.isEventDate(dateTime))
		_this.date = dateTime.valueOf();
	else
		return done('Date is not valid');*/
	/*_this.duration = talkInfo.duration;
	//Check types of talk
	if(talkTypes.indexOf(talkInfo.type) > -1)
		_this.type = talkInfo.type;
	else if(talkInfo.type) //if info has type of talk but not validated
		return done('Not a valid type.');

	var location = utilities.getLocation(talkInfo.location);
	if(location){
		_this.location = location;
	}*/
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

Talk.statics.isValidType = function(typeString){
	return (global.Event.talk.types.indexOf(typeString) > -1);
}
Talk.statics.isValidEvent = function(eventType){
	return (global.Event.talk.events.indexOf(eventType) > -1);
}

module.exports = mongoose.model('talks',Talk);
