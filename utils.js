var emailSender = require('emailjs'),
server = emailSender.server.connect({
	user : 'avneesh.raghav@mindgrep.com',
	password : 'damnhacker',
	host : 'smtp.gmail.com',
	tls : true,
	port : 587
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
			message.from = 'HillHacks';
		utils.sendEmail(message,done);
	},
	isValidEmail : function(email){
	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	},
	isValidPhone : function(phone){
		var re = /^\d{10}$/;
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
	}	
}

module.exports = utils;