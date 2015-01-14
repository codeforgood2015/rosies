var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var timeslotSchema = mongoose.Schema({
	//things id in database
	dayOfWeek: {type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']},
	date: Date,

	//things to modify html
	time: [String], //Format: ['9:00am', '10:00am'] [starttime, endtime] 
	maxCapacity: Number,
	maxWaitlist: Number,

	//things to print out
	guests: {type: Array, default: []},
	waitlist: {type: Array, default: []}

});

module.exports.Timeslot = mongoose.model('Timeslot', timeslotSchema);