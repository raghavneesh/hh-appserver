//var mongoose = require('mongoose');
//var ObjectId = mongoose.Schema.ObjectId;

var moment = require('moment'); /* Date conversion */

var http = require('http-request');

module.exports = {
    loadWiki : function(title, text, callback) {
	var reqBody = {"jsonrpc": "2.0", "method": {"methodName": "dokuwiki.login"}, "params": [{"string":"root"},{"string":"user0123"}], "id": "10"};
	var authcookie;

	reqBody = JSON.stringify(reqBody);

	http.post({
	    url: '192.168.1.117/dokuwiki/lib/plugins/jsonrpc/jsonrpc.php',
	    reqBody: new Buffer(reqBody),
	    headers: {
		'content-type': 'application/json'
	    }
	}, function (err, res) {
	    if (err) { return callback(err,null); }

	    authcookie = res.headers['set-cookie'][0].split(';')[0] + ";" + res.headers['set-cookie'][2].split(';')[0];
//	    console.log(res.code, res.headers['set-cookie'], res.buffer.toString());
//	    console.log(authcookie);
	    
	    var reqBody2 = {"jsonrpc": "2.0", "method": {"methodName": "wiki.putPage"}, "params": [{"string":title},{"string":text}], "id": "1"};
	    reqBody2 = JSON.stringify(reqBody2);
	    
	    http.post({
		url: '192.168.1.117/dokuwiki/lib/plugins/jsonrpc/jsonrpc.php',
		reqBody: new Buffer(reqBody2),
		method: 'POST',
		headers: {
		    'Content-Type': 'application/json',
		    'Cookie': authcookie
		}
	    }, function (err, res2) {
		if (err) { return callback(err); }
//		console.log(res2.code, res2.headers,res2.buffer.toString());
	    });
	});
    },

    extractMongo : function(uid, Users, Talks, Booking, Accommodation, Pickup, callback) {
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
		var pickuptext;
		
		wikidata.useremail = users.email;
		Booking.findOne({user: users._id}, function(err, bookings) {
		    wikidata.usertitle = bookings.username;
		    
		    wikidata.usertext = "---- dataentry signup ----\n";
		    wikidata.usertext += "type : signup\n";
		    wikidata.usertext += "interestlevel : " +
			(users.confirmed ?
			 "Yes I am coming" :
			 "I am coming, don't know when exactly yet") + "\n";
		    
		    wikidata.usertext += "accommodation :" +
			(bookings.accommodation ?
			 "Yes" : "No") + "\n";

		    /* Arrival / Departure - there are no separate accoms dates */
		    wikidata.user += "arrival : " + moment(bookings.arrival_date, 'yyyy-MM-DD') + "\n";
		    wikidata.user += "departure : " + moment(bookings.depart_date, 'yyyy-MM-DD') + "\n";

		    wikidata.usertext += "publication_hidden : Yes \n";
		    
		    wikidata.usertext += "email_hidden : " + users.email + "\n";
		    pickuptext = "pickup_hidden : " +
			(bookings.pickup ?
			 "Yes" : "No") + "\n";
						       
		});
		
		Accommodation.findOne({user : users._id}, function(err, accommodation) {
		    wikidata.usertext += "family_hidden : " +
			(accommodation.family ?
			 "Yes" : "No" ) + "\n";

		    wikidata.usertext += "familydetails_hidden : " +
			(accommodation.family_details ?
			 "Yes" : "No" ) + "\n";

		    wikidata.usertext += "extra";
		    wikidata.usertext += "extrainfo_hidden    : --[fixed as not entered in app]\n";
		    wikidata.usertext += "mainconf_hidden     : --[fixed as not entered in app]\n";
		    wikidata.usertext += "preconf_hidden      : --[fixed as not entered in app]\n";
		    wikidata.usertext += "attendcode_hidden   : --[fixed as not entered in app]\n";
		    wikidata.usertext += "teachcode_hidden    : --[fixed as not entered in app]\n";
		    wikidata.usertext += "teachschool_hidden  : --[fixed as not entered in app]\n";
		    wikidata.usertext += "presentconf_hidden  : --[fixed as not entered in app]\n";

		    wikidata.usertext += "tent_hidden : " +
			(accommodation.tent ?
			 "Yes" : "No") + "\n";

		    wikidata.usertext += "sleepingbag_hidden : " +
			(accommodation.sleeping_bag ?
			 "Yes" : "No") + "\n";

		    wikidata.usertext += "mat_hidden : " +
			(accommodation.mat ?
			 "Yes" : "No") + "\n";

		    wikidata.usertext += "pillow_hidden : " +
			(accommodation.pillow ?
			 "Yes" : "No") + "\n";
		});


		Pickup.findOne({user : users._id}, function(err, pickup) {
		    wikidata.usertext += pickuptext;
		    wikidata.usertext += "pickuploc_hidden : " + pickup.location + "\n";

		    wikidata.usertext += "pickupdate_hidden : " +
			moment(pickup.date).format('YYYY-MM-DD') + "\n";
		    console.log(pickup.date);
		    console.log(moment(pickup.date).format('YYYY-MM-DD'));
		    wikidata.usertext += "pickupseats_hidden : " +
			pickup.seats + "\n";
		    wikidata.usertext += "pickuptime_hidden : " +
			pickup.time + "\n";
		    
		});

		
		//Extracting User Talks Data from MongoDB
		Talks.find({user: users._id}, function(err, talks) {
		    if (err) return callback(err,null);
		    for (var prop in talks) {
			//Collating User Talks Data
			wikidata.talktitle = talks[prop].title;
			wikidata.talktype = talks[prop].type;
			
			wikidata.talktext = "---- dataentry signup ----\n";
			wikidata.talktext += "type : " + talks[prop].type + "\n";
			wikidata.talktext += "title : " + talks[prop].title + "\n";
			wikidata.talktext += "eventtype : " + talks[prop].event + "\n";
			wikidata.talktext += "duration : " + 
			    (talks[prop].duration.length > 0 ? 
			     talks[prop].duration : "N/A") + "\n";
			wikidata.talktext += "other_hidden : No\n";
			wikidata.talktext += "othname_hidden : No\n";
			wikidata.talktext += "projector_hidden : " +
			    (talks[prop].needsProjector ?
			     "Yes" : "No") + "\n";
			
			wikidata.talktext += "tool_hidden : " +
			    (talks[prop].needsTools ?
			     "Yes, I need tools" :
			     "No, I don't need any tools") + "\n";

			wikidata.talktext += "toolSpec_hidden : N.A \n";
			wikidata.talktext += "else_hidden" +
			    ((talks[prop].length > 0) ?
			     talks[prop].length :
			     "No") + "\n";
			wikidata.talktext += "abstract_hidden : " +
			    talks[prop].description + "\n";

			wikidata.talktext += "speaker_hidden : " +
			    users.first_name + users.last_name + "\n";

			callback(null, wikidata);
//			console.log(wikidata.talktext);
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
	    url: '192.168.1.117/dokuwiki/lib/plugins/jsonrpc/jsonrpc.php',
	    reqBody: new Buffer(reqBody),
	    headers: {
		'content-type': 'application/json'
	    }
	}, function (err, res) {
	    if (err) { return console.error(err); }

	    authcookie = res.headers['set-cookie'][0].split(';')[0] + ";" + res.headers['set-cookie'][2].split(';')[0];
//	    console.log(res.code, res.headers['set-cookie'], res.buffer.toString());
//	    console.log(authcookie);
	    
	    var reqBody2 = {"jsonrpc": "2.0", "method": {"methodName": "dokuwiki.createUser"}, "params": [{"string":nick},{"string":pass},{"string":name},{"string":email}], "id": "webClient"};
	    reqBody2 = JSON.stringify(reqBody2);
	    
	    http.post({
		url: '192.168.1.117/dokuwiki/lib/plugins/jsonrpc/jsonrpc.php',
		reqBody: new Buffer(reqBody2),
		method: 'POST',
		headers: {
		    'Content-Type': 'application/json',
		    'Cookie': authcookie
		}
	    }, function (err, res2) {
		if (err) { return console.error(err); }
//		console.log(res2.code, res2.headers,res2.buffer.toString());
	    });
	});
    }
}
