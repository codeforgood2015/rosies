var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId();

var rulesSchema = mongoose.Schema( {
	maxCap: Number, 
	maxWaitlist: Number,
	startTime: String, // military time string
	duration: Number, // in hours, should be 1 by default
	date: String, // either day of week or a date string
	repeat: Boolean, //true if rule should repeat yearly
	type: Boolean // type of rule, should be true for default rules
});

module.exports.Rule = mongoose.model('Rule', rulesSchema);