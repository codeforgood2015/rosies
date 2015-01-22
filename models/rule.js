var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId();

var rulesSchema = mongoose.Schema({
	maxCap: Number, 
	maxWaitlist: Number,
	time: [String], // military time string, should be size 2
	date: String, // either day of week or a date string
	repeat: Boolean //true if rule should repeat yearly
});

module.exports.Rule = mongoose.model('Rule', rulesSchema);