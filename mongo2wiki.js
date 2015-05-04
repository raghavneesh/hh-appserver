var moment = require('moment'); /* Date conversion */
var http = require('http-request');

module.exports = {
    loadWiki : function(title, text, callback) {
	var reqBody = {"jsonrpc": "2.0", "method": {"methodName": "dokuwiki.login"}, "params": [{"string":"username"},{"string":"password"}], "id": "10"};
	var authcookie;

	reqBody = JSON.stringify(reqBody);

	http.post({
	    url: 'http://hillhacks.in/lib/plugins/jsonrpc/jsonrpc.php',
	    reqBody: new Buffer(reqBody),
	    headers: {
		'content-type': 'application/json'
	    }
	}, function (err, res) {
	    if (err) { return callback(err,null); }

//	    console.log(res.headers['set-cookie']);
	    if(res.headers['set-cookie'].length > 2) {
		authcookie = res.headers['set-cookie'][0].split(';')[0] + ";" + res.headers['set-cookie'][2].split(';')[0];
	    }
	    else {
		authcookie = res.headers['set-cookie'][0].split(';')[0] + ";" + res.headers['set-cookie'][1].split(';')[0];
	    }
//	    console.log(res.code, res.headers['set-cookie'], res.buffer.toString());
//	    console.log(authcookie);
	    
	    var reqBody2 = {"jsonrpc": "2.0", "method": {"methodName": "wiki.putPage"}, "params": [{"string":title},{"string":text}], "id": "1"};
	    reqBody2 = JSON.stringify(reqBody2);
	    
	    http.post({
		url: 'http://hillhacks.in/lib/plugins/jsonrpc/jsonrpc.php',
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
	//Extracting User Signup Data from MongoDB
	Users.findOne({email: uid}, function(err, users) {
	    if (err) return callback(err,null);
	    if (users) {
		//Collating User Signup Data 
		var wikidata = {};
		var pickuptext;
		
		wikidata.useremail = users.email;
		wikidata.bookingtext = "";
		wikidata.accommodationtext = "";
		wikidata.pickuptext = "";

		Booking.findOne({user: users._id}, function(err, bookings) {
		    wikidata.usertitle = bookings.username;

		    wikidata.bookingtext = "====== "+ bookings.username+" ======\n" ;

		    wikidata.bookingtext += "\n**What would you like to do at hillhacks:** \n\n";
		    wikidata.bookingtext += "Attend Main Conference Events         : Unknown \n";
		    wikidata.bookingtext += "Attend Pre Conference Events          : Unknown \n";
		    wikidata.bookingtext += "Present a talk, workshop or session   : "+(bookings.talk ? "Yes" : "No")+" \n";
		    wikidata.bookingtext += "Teach in the school outreach sessions : Unknown \n";
		    wikidata.bookingtext += "Attend Learn To Code                  : Unknown \n";
		    wikidata.bookingtext += "Mentor at Learn To Code               : Unknown \n";

		    wikidata.bookingtext += "\n**Some more information about you:** \n\n";
		    wikidata.bookingtext += "Will be filled by the user later. \n";

		    wikidata.bookingtext += "\n\n//''NOTE: Content autogenerated using [[https://github.com/cherrymathew/evend|Evend]].''// \n";

		    wikidata.bookingtext += "---- dataentry signup ----\n";
		    wikidata.bookingtext += "type : signup\n";
		    wikidata.bookingtext += "interestlevel : " +
			(users.confirmed ?
			 "Yes I am coming, dates set!" :
			 "I am thinking of coming, not sure yet") + "\n";
		    
		    wikidata.bookingtext += "accommodation : " +
			(bookings.accommodation ?
			 "Yes" : "No") + "\n";

		    /* Arrival / Departure - there are no separate accoms dates */
		    wikidata.bookingtext += "arrival : " + moment(bookings.arrival_date).format('YYYY-MM-DD') + "\n";
		    wikidata.bookingtext += "departure : " + moment(bookings.departure_date).format('YYYY-MM-DD') + "\n";

		    wikidata.bookingtext += "publication_hidden : No \n";
		    
		    wikidata.bookingtext += "email_hidden : " + users.email + "\n";

		    wikidata.bookingtext += "extrainfo_hidden    : --\n";
		    wikidata.bookingtext += "mainconf_hidden     : --\n";
		    wikidata.bookingtext += "preconf_hidden      : --\n";
		    wikidata.bookingtext += "attendcode_hidden   : --\n";
		    wikidata.bookingtext += "teachcode_hidden    : --\n";
		    wikidata.bookingtext += "teachschool_hidden  : --\n";
		    wikidata.bookingtext += "presentconf_hidden  : "+(bookings.talk ? "Yes" : "No")+"\n";


		    // Pickup data which is present in the bookings table
		    pickuptext = "pickup_hidden : " +
			(bookings.pickup ?
			 "Yes" : "No") + "\n";
		    wikidata.pickuptext += pickuptext;
		});
		
		Accommodation.findOne({user : users._id}, function(err, accommodation) {
		    wikidata.accommodationtext += "family_hidden : " +
			(accommodation.family ?
			 "Yes" : "No" ) + "\n";

		    if(accommodation.family_details) {
			wikidata.accommodationtext += "familydetails_hidden : " + accommodation.family_details +"\n";
		    }
		    else {
			wikidata.accommodationtext += "familydetails_hidden : --\n";
		    }

		    wikidata.accommodationtext += "tent_hidden : " +
			(accommodation.tent ?
			 "Yes" : "No") + "\n";

		    wikidata.accommodationtext += "sleepingbag_hidden : " +
			(accommodation.sleeping_bag ?
			 "Yes" : "No") + "\n";

		    wikidata.accommodationtext += "mat_hidden : " +
			(accommodation.mat ?
			 "Yes" : "No") + "\n";

		    wikidata.accommodationtext += "pillow_hidden : " +
			(accommodation.pillow ?
			 "Yes" : "No") + "\n";
		});


		Pickup.findOne({user : users._id}, function(err, pickup) {
		    wikidata.pickuptext += "pickuploc_hidden : " + pickup.location + "\n";

		    wikidata.pickuptext += "pickupdate_hidden : " +
			moment(pickup.date).format('YYYY-MM-DD') + "\n";
		    wikidata.pickuptext += "pickupseats_hidden : " +
			pickup.seats + "\n";
		    wikidata.pickuptext += "pickuptime_hidden : " +
			pickup.time + "\n";
		});
		
		//Extracting User Talks Data from MongoDB
		Talks.find({user: users._id}, function(err, talks) {
		    if (err) return callback(err,null);
		    for (var prop in talks) {
			//Collating User Talks Data
			wikidata.talktitle = talks[prop].title;
			wikidata.talktype = talks[prop].type;
			wikidata.eventtype = talks[prop].event;
			
			wikidata.talktext = "=== Abstract ===\n" ;
			wikidata.talktext += "Will be filled by the speaker later. \n";

			wikidata.talktext += "\n=== Main Description ===\n" ;
			wikidata.talktext += "Will be filled by the speaker later. \n";

			wikidata.talktext += "\n=== Speaker ===\n" ;
			wikidata.talktext += "Will be filled by the speaker later. \n";

			wikidata.talktext += "\n//''NOTE: Content autogenerated using [[https://github.com/cherrymathew/evend|Evend]].''// \n";

			wikidata.talktext += "\n---- dataentry signup ----\n";
			wikidata.talktext += "type_hidden : " + talks[prop].type + "\n";
			wikidata.talktext += "title : " + talks[prop].title + "\n";
			wikidata.talktext += "email_hidden : " + users.email + "\n";
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

			wikidata.talktext += "else_hidden : " +
			    ((talks[prop].length > 0) ?
			     talks[prop].length :
			     "No") + "\n";

			if(talks[prop].needsTools) {
			    if(talks[prop].notes) {
				wikidata.talktext += "toolSpec_hidden : " + talks[prop].notes + " \n";
			    }
			    else {
				wikidata.talktext += "toolSpec_hidden : N.A \n";
			    }
			} 
			else {
			    wikidata.talktext += "toolSpec_hidden : N.A \n";
			}

			wikidata.talktext += "abstract_hidden : Will be filled by the speaker later. \n";
			wikidata.talktext += "speaker_hidden : Will be filled by the speaker later. \n";
			
			wikidata.talktext += "autogenerated_hidden : yes \n";
			callback(null, wikidata);
//			console.log(wikidata.talktext);
		    }
		});
	    }
	});
    },

    createUser : function(nick, pass, name, email) {
	var reqBody = {"jsonrpc": "2.0", "method": {"methodName": "dokuwiki.login"}, "params": [{"string":"username"},{"string":"password"}], "id": "10"};
	var authcookie;

	reqBody = JSON.stringify(reqBody);

	http.post({
	    url: 'http://hillhacks.in/lib/plugins/jsonrpc/jsonrpc.php',
	    reqBody: new Buffer(reqBody),
	    headers: {
		'content-type': 'application/json'
	    }
	}, function (err, res) {
	    if (err) { return console.error(err); }

	    if(res.headers['set-cookie'].length > 2) {
		authcookie = res.headers['set-cookie'][0].split(';')[0] + ";" + res.headers['set-cookie'][2].split(';')[0];
	    }
	    else {
		authcookie = res.headers['set-cookie'][0].split(';')[0] + ";" + res.headers['set-cookie'][1].split(';')[0];
	    }
//	    console.log(res.code, res.headers['set-cookie'], res.buffer.toString());
//	    console.log(authcookie);
	    
	    var reqBody2 = {"jsonrpc": "2.0", "method": {"methodName": "dokuwiki.createUser"}, "params": [{"string":nick},{"string":pass},{"string":name},{"string":email}], "id": "webClient"};
	    reqBody2 = JSON.stringify(reqBody2);
	    
	    http.post({
		url: 'http://hillhacks.in/lib/plugins/jsonrpc/jsonrpc.php',
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
