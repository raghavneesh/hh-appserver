exports.conf = {
	"db" : {
		"name" : "hillhacks",
		"host" : "localhost",
		"port" : 3649
	},
	"event" : {
		"startDate" : new Date("2015-05-20").getTime(),
		"endDate" : new Date("2015-06-08").getTime(),
		"talk" : {
			"types" : ['workshop','talk','classroom']
		}
	}
}