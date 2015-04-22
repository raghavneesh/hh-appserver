exports.conf = {
	"db" : {
		"name" : "hillhacks",
		"host" : "localhost",
		"port" : 3649
	},
	"event" : {
		"startDate" : new Date("2015-05-01").getTime(),
		"endDate" : new Date("2015-06-08").getTime(),
		"talk" : {
			"types" : ['talk','workshop','session'],
			"events" : ['codecamp', 'schoolprogram', 'unconference', 'mainconference']
		},
		"accommodation" : {
			"types" : ["pillow", "mat", "sleepingbag","tent"]
		},
		"locations" : [{
			"name" : "Dharamsala Bus stand",
			"value" : "dbus",
			"charge" : 250
		},{
			"name" : "Macleod Gunj",
			"value" : "mcleod",
			"charge" : 350
		},{
			"name" : "Pathankot Railway Station",
			"value" : "ptkt",
			"charge" : 1000
		}]
	}
}
