var express = require('express');
var router = express.Router();
var Admin = require('../models/admin').Admin;
var utils = require('../utils/utils');

// GET /admin - return a list of all admins
// TODO: Check log-in status
router.get('/', function(req, res) {
	// Admin.find({}, function(err, admins) {
	// 	utils.sendSuccessResponse(res, admins);
	// });
	res.render('admintest');
});

/*
	POST /admin - create a new admin user
	Request body: 
	- username: String
	- password: String
*/


//GET /admin/usernames - return list of all admin usernames
router.get('/usernames', function(req, res) {
	Admin.find({}, function(err, admins) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			var usernames = [];
			for (admin in admins) {
				usernames.push({username: admin.username, _id: admin._id});
			}
			utils.sendSuccessResponse(res, usernames);
		}
	});
});


// TODO: use bcrypt to hash the password to be stored
router.post('/', function(req,res) {
	var data = {
		username: req.body.username,
		password: req.body.password,
		type: req.body.type
	};
	Admin.find({username: data.username}, function(err, admins) {
		// TODO: check whether we need to check for null on admins
		if (admins && admins.length > 0) {
			utils.sendErrResponse(res, 403, 'Username already exists');
		} else {
			admin = new Admin(data);
			admin.save(function(err) {
				if (err) {
					utils.sendErrResponse(res, 404, err);
				}
			});
		}
	});
});

// checks whether a given username is taken or not; might need to be fixed 
//returns an error response if username is taken, returns success response with valid:true if username is available
//to be called whenever admin types in a new username, so that an error message can display right underneath the text box
router.post('/check-username', function(req, res) {
	var check_username = req.body.username;
	Admin.find({username: check_username}, function(err, admins) {
		if (admins && admins.length > 0) {
			var response = {valid: false};
		} else {
			var response = {valid: true};
		}
		utils.sendSuccessResponse(res, response); //returns true if username is available, false if username is taken
	})
});

module.exports = router;