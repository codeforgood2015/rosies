var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var guestSchema = mongoose.Schema({
	username: String,
	password: String
});

module.exports.Guest = mongoose.model('Guest', guestSchema);