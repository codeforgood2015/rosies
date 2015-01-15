var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId();

var rulesSchema = mongoose.Schema( {
	maxCap: Number, 
	maxWaitlist: Number,
	time: [String],
	date: Schema.Types.Mixed,
	repeat: Boolean //true if rule should repeat yearly
});

module.exports.Rule = mongoose.model('Rule', rulesSchema);