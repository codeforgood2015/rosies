var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId();

var rulesSchema = mongoose.Schema({
	maxCap: Number, 
	maxWaitlist: Number,
	time: [String], // military time string, should be size 2
	date: String, // either day of week or a date string yyyy-mm-dd
	repeat: Boolean
});

module.exports.Rule = mongoose.model('Rule', rulesSchema);