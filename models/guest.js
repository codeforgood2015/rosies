var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var guestSchema = mongoose.Schema({
	firstName: String,
	lastName: String,
	birthday: Date, //should be the date at midnight
	lastVisit: Date //should be a date object so that we can perform checks
});

module.exports.Guest = mongoose.model('Guest', guestSchema);