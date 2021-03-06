var mongoose = require('mongoose');
var Schema = mongoose.Schema
var ObjectId = Schema.ObjectId;

var adminSchema = mongoose.Schema({
	username: String,
	password: String,
	type: String // 'volunteer' or 'admin'
});

module.exports.Admin = mongoose.model('Admin', adminSchema);