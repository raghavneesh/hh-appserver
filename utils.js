var emailSender = require('emailjs'),
server = emailSender.server.connect({
	user : 'avneesh.raghav@mindgrep.com',
	password : 'damnhacker',
	host : 'smtp.gmail.com',
	tls : true,
	port : 587
});

var utils = {
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
	}	
}

module.exports = utils;