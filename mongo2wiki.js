var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var rpc = require('node-json-rpc');

module.exports = {
    export: function(uid) {
	// Connect to MongoDB
	mongoose.connect('mongodb://localhost:27017/hillhacks_dev', function(err) {
	    if (err) return console.log(err);

	    //TalkSchema
	    var TalkSchema = mongoose.Schema({
		_id : ObjectId,
		user : ObjectId,
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

	    //UserSchema
	    var UserSchema = mongoose.Schema({
		_id : ObjectId,
		email : 'String',
		phone : 'String',
		first_name : 'String',
		last_name : 'String',
		created_at : 'Number',
		last_login : 'Number',
		oauth : 'Mixed',
		isVerified : 'Boolean',
		verifier : 'String',
		talks : 'Mixed',
		confirmed : Boolean
	    })

	    var options = {
		// int port of rpc server, default 5080 for http or 5433 for https 
		port: 10980,
		// string domain name or ip of rpc server, default '127.0.0.1' 
		host: 'fooobar.mooo.com',
		// string with default path, default '/' 
		path: '/dokuwiki/lib/plugins/jsonrpc/jsonrpc.php',
		// boolean false to turn rpc checks off, default true 
		strict: true
	    };

	    //Creating MongoDB Models based on Schema
	    var Talks = mongoose.model('Talk', TalkSchema);
	    var Users = mongoose.model('User', UserSchema);

	    // Creating JSON RPC Client
	    var client = new rpc.Client(options);

	    //Extracting Data from MongoDB
	    Users.findOne({email: uid}, function(err, users) {
		if (err) return console.error(err);
		if (users) {
		    console.log(users.email);
		    Talks.find({user: users._id}, function(err, talks) {
			if (err) return console.error(err);
			for (var prop in talks) {
			    wikitext = "---- dataentry signup ----\n" + "type:" + talks[prop].type + "\ntitle:" + talks[prop].title + "\neventtype:" + talks[prop].event + "\nduration:" + talks[prop].duration;
			    wikititle = talks[prop].title;
			    client.call(
				{"jsonrpc": "2.0", "method": {methodName: "dokuwiki.login"}, "params": [{string:"admin"},{string:"admin12345"}], "id": 0},
				function (err, res) {
				    // Did it all work ? 
				    if (err) { console.log(err); }
				    else { console.log(res); }
				}
			    );

			    client.call(
				{"jsonrpc": "2.0", "method": {methodName: "wiki.putPage"}, "params": [{string:wikititle},{string:wikitext}], "id": 1},
				function (err, res) {
				    // Did it all work ? 
				    if (err) { console.log(err); }
				    else { console.log(res); }
				}
			    );
			    console.log(wikitext);
			}
		    });
		}
	    });
	});
    }
}
