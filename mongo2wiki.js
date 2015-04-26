//var mongoose = require('mongoose');
//var ObjectId = mongoose.Schema.ObjectId;
var http = require('http-request');

module.exports = {
    loadWiki : function(title, text, callback) {
	var reqBody = {"jsonrpc": "2.0", "method": {"methodName": "dokuwiki.login"}, "params": [{"string":"root"},{"string":"user0123"}], "id": "10"};
	var authcookie;

	reqBody = JSON.stringify(reqBody);

	http.post({
	    url: '192.168.1.115/dokuwiki/lib/plugins/jsonrpc/jsonrpc.php',
	    reqBody: new Buffer(reqBody),
	    headers: {
		'content-type': 'application/json'
	    }
	}, function (err, res) {
	    if (err) { return callback(err,null); }

	    authcookie = res.headers['set-cookie'][0].split(';')[0] + ";" + res.headers['set-cookie'][2].split(';')[0];
	    console.log(res.code, res.headers['set-cookie'], res.buffer.toString());
	    console.log(authcookie);
	    
	    var reqBody2 = {"jsonrpc": "2.0", "method": {"methodName": "wiki.putPage"}, "params": [{"string":title},{"string":text}], "id": "1"};
	    reqBody2 = JSON.stringify(reqBody2);
	    
	    http.post({
		url: '192.168.1.115/dokuwiki/lib/plugins/jsonrpc/jsonrpc.php',
		reqBody: new Buffer(reqBody2),
		method: 'POST',
		headers: {
		    'Content-Type': 'application/json',
		    'Cookie': authcookie
		}
	    }, function (err, res2) {
		if (err) { return callback(err); }
		console.log(res2.code, res2.headers,res2.buffer.toString());
	    });
	});
    },

    extractMongo : function(uid, Users, Talks, Booking, callback) {
	// Connect to MongoDB
//	mongoose.connect('mongodb://localhost:27017/hillhacks_dev', function(err) {
//	    if (err) return console.log(err);

	    //TalkSchema
//	    var TalkSchema = mongoose.Schema({
//		_id : ObjectId,
//		user : ObjectId,
//		title : String,
//		description : String,
//		date : Number,
//		duration : String,
//		type : String,
//		event : String,
//		notes : String,
//		location : {
//		    name : String,
//		    lat : Number,
//		    lng : Number
//		},
//		hasCoPresenters : Boolean,
//		needsProjector : Boolean,
//		needsTools : Boolean,
//		created_at : Number,
//		updated_at : Number
//	    });
//
//	    //UserSchema
//	    var UserSchema = mongoose.Schema({
//		_id : ObjectId,
//		email : 'String',
//		phone : 'String',
//		first_name : 'String',
//		last_name : 'String',
//		created_at : 'Number',
//		last_login : 'Number',
//		oauth : 'Mixed',
//		isVerified : 'Boolean',
//		verifier : 'String',
//		talks : 'Mixed',
//		confirmed : Boolean
//	    })
//
//	    //Creating MongoDB Models based on Schema
//	    var Talks = mongoose.model('Talk', TalkSchema);
//	    var Users = mongoose.model('User', UserSchema);
//
	//Extracting User Signup Data from MongoDB
	Users.findOne({email: uid}, function(err, users) {
	    if (err) return callback(err,null);
	    if (users) {
		//Collating User Signup Data 
		var wikidata = {};
		wikidata.useremail = users.email;
		Booking.findOne({user: users._id}, function(err, bookings) {
		    wikidata.usertext = "---- dataentry signup ----\n" + "email:" + users.email + "\nName:" + bookings.username;
		    wikidata.usertitle = bookings.username;
		});
		
		//Extracting User Talks Data from MongoDB
		Talks.find({user: users._id}, function(err, talks) {
		    if (err) return callback(err,null);
		    for (var prop in talks) {
			//Collating User Talks Data 
			wikidata.talktext = "---- dataentry signup ----\n" + "type:" + talks[prop].type + "\ntitle:" + talks[prop].title + "\neventtype:" + talks[prop].event + "\nduration:" + talks[prop].duration;
			wikidata.talktitle = talks[prop].title;
			wikidata.talktype = talks[prop].type;
			callback(null, wikidata);
			console.log(wikidata.talktext);
		    }
		});
	    }
	});
    },

    createUser : function(nick, pass, name, email) {
	var reqBody = {"jsonrpc": "2.0", "method": {"methodName": "dokuwiki.login"}, "params": [{"string":"root"},{"string":"user0123"}], "id": "10"};
	var authcookie;

	reqBody = JSON.stringify(reqBody);

	http.post({
	    url: '192.168.1.115/dokuwiki/lib/plugins/jsonrpc/jsonrpc.php',
	    reqBody: new Buffer(reqBody),
	    headers: {
		'content-type': 'application/json'
	    }
	}, function (err, res) {
	    if (err) { return console.error(err); }

	    authcookie = res.headers['set-cookie'][0].split(';')[0] + ";" + res.headers['set-cookie'][2].split(';')[0];
	    console.log(res.code, res.headers['set-cookie'], res.buffer.toString());
	    console.log(authcookie);
	    
	    var reqBody2 = {"jsonrpc": "2.0", "method": {"methodName": "dokuwiki.createUser"}, "params": [{"string":nick},{"string":pass},{"string":name},{"string":email}], "id": "webClient"};
	    reqBody2 = JSON.stringify(reqBody2);
	    
	    http.post({
		url: '192.168.1.115/dokuwiki/lib/plugins/jsonrpc/jsonrpc.php',
		reqBody: new Buffer(reqBody2),
		method: 'POST',
		headers: {
		    'Content-Type': 'application/json',
		    'Cookie': authcookie
		}
	    }, function (err, res2) {
		if (err) { return console.error(err); }
		console.log(res2.code, res2.headers,res2.buffer.toString());
	    });
	});
    }
}
