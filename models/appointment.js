var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var appointmentSchema = mongoose.Schema({
	date: Date,
	timeslot: [String], 
	firstName: String,
	lastName: String,
	birthday: Date,
	premade: Boolean,
	waitlist: Number // 0 if not on waitlist, otherwise represents position on waitlist
});

//add some validators?

module.exports.Appointment = mongoose.model('Appointment', appointmentSchema);