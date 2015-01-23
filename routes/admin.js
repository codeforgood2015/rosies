var express = require('express');
var router = express.Router();
var Admin = require('../models/admin').Admin;
var utils = require('../utils/utils');
var bcrypt = require('bcrypt');

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
			for (var i = 0; i < admins.length; i ++) {
				usernames.push({username: admins[i].username, _id: admins[i]._id, type: admins[i].type});
			}
			utils.sendSuccessResponse(res, usernames);
		}
	});
});

/*
	POST /admin - creates a new admin user
	Request body:
	- username: Username for the new admin. Error returned if it's already taken.
	- password: Password for the new admin. Encrypted by bcrypt.
	- type: Permissions level for the new admin user.
*/
router.post('/', function(req,res) {
	var data = {
		username: req.body.username,
		type: req.body.type
	}
	Admin.findOne({username: data.username}, function(err, admin) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else if (admin) {
			utils.sendErrResponse(res, 400, 'Username already exists.');
		} else {
			bcrypt.hash(req.body.password, 10, function(err, hash) {
				data.password = hash;
				admin = new Admin(data);
				admin.save(function(err) {
					if (err) {
						utils.sendErrResponse(res, 404, err);
					} else {
						utils.sendSuccessResponse(res, 'User created.');
					}
				})
			});
		}
	});
});

//DELETE /admin/delete - deletes an admin account based on its _id
router.post('/delete', function(req, res) {
	var myID = req.body._id;
	Admin.remove({_id:myID}, function(err, admin) {
		if (err) {
			utils.sendErrResponse(res, 400, 'Could not remove account');
		} else {
			utils.sendSuccessResponse(res, admin);
		}
	});
});

/*
	PUT /admin - Log in an user
	Request body:
	- username: Username for the admin.
	- password: Password for the admin
*/
router.put('/', function(req, res) {
	Admin.findOne({username: req.body.username}, function(err, admin) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else if (admin) {
			bcrypt.compare(req.body.password, admin.password, function(err, result) {
				if (result) {
					req.session.name = req.body.username;
					req.session.userId = admin._id;
					utils.sendSuccessResponse(res, 'Logged in.');
				} else {
					utils.sendErrResponse(res, 401, 'Incorrect password.');
				}
			});
		} else {
			utils.sendErrResponse(res, 401, 'Incorrect username.');
		}
	});
});

router.get('/check', function(req, res) {
	utils.sendSuccessResponse(res, {name: req.session.name, id: req.session.userId});
});

/*
	PUT /admin/logout - logs out a user and clears session cookies
	Returns: 
	String: 'Successfully logged out.'
*/
router.put('/logout', function(req, res) {
	req.session.name = null;
	req.session.userId = null;
	utils.sendSuccessResponse(res, 'Successfully logged out.')
})

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