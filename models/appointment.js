var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var appointmentSchema = mongoose.Schema({
	date: Date,
	timeslot: [String], 
	firstName: String,
	lastName: String,
	birthday: Object,
	premade: Boolean,
	waitlist: Boolean
});

//add some validators?

module.exports.Appointment = mongoose.model('Appointment', appointmentSchema);