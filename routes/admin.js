var express = require('express');
var router = express.Router();
var Admin = require('../models/admin').Admin;
var utils = require('../utils/utils');

// GET /admins - return a list of all admins
// TODO: Check log-in status
router.get('/', function(req, res) {
	Admin.find({}, function(err, admins) {
		utils.sendSuccessResponse(res, admins);
	});
});

/*
	POST /admins - create a new admin user
	Request body: 
	- username: String
	- password: String
*/


// TODO: use bcrypt to hash the password to be stored
router.post('/', function(req,res) {
	var data = {
		username: req.body.username,
		password: req.body.password,
	};
	Admin.find({username: data.username}, function(err, admins) {
		// TODO: check whether we need to check for null on admins
		if (admins && admins.length > 0) {
			utils.sendErrResponse(res, 403, 'This username already exists');
		} else {
			admin = new Admin(data);
			admin.save(function(err) {
				utils.sendErrResponse(res, 404, err);
			});
		}
	});
});

module.exports = router;