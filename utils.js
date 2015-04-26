var emailSender = require('emailjs'),
moment = require('moment')
server = emailSender.server.connect({
	user : 'notify@mydomain.com',
	password : 'myhardpassword',
	host : 'mysuperhost',
	tls : true, /* Recommended */
	port : 587 /* YMMV */
});

var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
},
utils = {
	/*
	* The acceptable keys are :
	* text, from, to, cc, subject
	*/
	sendEmail : function(message,done){
		server.send(message,done);
	},
	sendHHEmail : function(message, done){
		if(!message)
			return; //Throw exception
		if(!message.from)
			message.from = 'Please fill up the sender field.';
		utils.sendEmail(message,done);
	},
	isValidEmail : function(email){
	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	},
	isValidPhone : function(phone){
		var re = /^(\+91-|\+91|0)?\d{10}$/;
		return re.test(phone);
	},
	randomString : function(){
		var buf = [], 
		chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 
		charlen = chars.length;
		  for (var i = 0; i < charlen; ++i) {
		    buf.push(chars[getRandomInt(0, charlen - 1)]);
		  }
		  return buf.join('');
	},
	isValidDate : function(dateStr, format){
		if(!dateStr)
			return false;
		return moment(dateStr, format).isValid();
		/*var dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
		return dateReg.test(dateStr);*/
	},
	validDates : function(dates,seperator){
		if(typeof dates !== 'string' && typeof dates !== 'object')
			return false;
		if(typeof dates === 'string')
			dates = dates.split(seperator || ',');

		for(var i=0;i<dates.length;i++){
			if(!utils.isValidDate(dates[i]), 'DD-MM-yyyy')
				return false;
		}
	},
	/*
	* Convert dateString (multiple dates separated by comma) into
	* proper date format. Date should be in the format/sequence of DD-MM-YYYY
	* where MM and YYYY are optional.
	* In case of month and year absence event startDate month and year are used.
	*
	*/
	formatEventRequestedDates : function(datesString){
		var requestDates = datesString.split(','),
		dates = [],
		eventStartDate = moment(Event.startDate),
		eventEndDate = moment(Event.endDate),
		getFormattedDates = function(date){
			var dateInfo = date.split('-');
			switch(dateInfo.length){
				case 1 : dateInfo.push(eventStartDate.month()); 
				case 2 : dateInfo.push(eventStartDate.year());
			}

			return moment(dateInfo.reverse());
		};

		for(var i=0;i<requestDates.length;i++){
			var date = requestDates[i];
			dates.push(getFormattedDates(date));
		}
		return dates;
	},
	/*
	* Check date string and convert it in to proper dates.
	* Check whether date falls in to the event start and end date range.
	* Return array of acceptable dates, discard if any date is not valid or
	* lies in the given range.
	*
	*/
	getEventAcceptableDates : function(datesString){
		if(!datesString)
			return;
		var formattedDates = utils.formatEventRequestedDates(datesString),
		eventDates = [];
		if(!formattedDates || !formattedDates.length)
			return;
		for(var i=0;i<formattedDates.length;i++){
			var formattedDate = formattedDates[i];
			if(utils.isEventDate(formattedDate))
				eventDates.push(formattedDate.valueOf());
		}
		return eventDates;
	},
	/*
	* Check if moment date is valid and lies in events date range
	*/
	isEventDate : function(momentDate){
		if(!momentDate.isValid())
				return false;
		var timeStamp = momentDate.valueOf(); //Get the date timestamp
		if(timeStamp < Event.startDate || timeStamp > Event.endDate) //Compare dates
			return false;
		return true;
	},
	getLocation : function(locationString){
		if(!locationString)
			return;
		var location = {},
		locationInfo = locationString.split('~');
		location.name = locationInfo[0];
		if(locationInfo.length > 2){
			location.lat = locationInfo[1];
			location.lng = locationInfo[2];
		}
		return location;
	}	
}

module.exports = utils;
