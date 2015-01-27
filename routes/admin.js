var express = require('express');
var router = express.Router();
var Admin = require('../models/admin').Admin;
var utils = require('../utils/utils');
var bcrypt = require('bcrypt');

/*
	GET /admin - Render a view for administrators to modify their settings.
*/
router.get('/', function(req, res) {
	res.render('admintest');
});

/*
	GET /admin/usernames - return an array of all admin usernames
*/
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
	Restrictions:
	- Current user must be an admin level user.
*/
router.post('/', utils.checkAdmin, function(req,res) {
	var data = {
		username: req.body.username,
		type: req.body.type
	};
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
				});
			});
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
					req.session.type = admin.type;
					/*req.session.save(function(err) {
						if (err) {
							utils.sendErrResponse(res, 404, err);
						} else {
							utils.sendSuccessResponse(res, req.session);
							//utils.sendSuccessResponse(res, 'Logged in.');
						}
					});*/utils.sendSuccessResponse(res, 'Logged in');
				} else {
					utils.sendErrResponse(res, 401, 'Incorrect password.');
				}
			});
		} else {
			utils.sendErrResponse(res, 401, 'Incorrect username.');
		}
	});
});

/*
	POST /admin/delete - deletes an admin account. The DELETE verb had problems with
		AngularJS, so using a POST instead.
	Request body: 
	- _id: ObjectId of the admin to be deleted.
*/
router.post('/delete', utils.checkAdmin, function(req, res) {
	var myID = req.body._id;
	Admin.find({type: 'admin'}, function(err, admins) {
		if (admins.length == 1) {
			utils.sendErrResponse(res, 401, 'Cannot remove the last admin.');
		} else {
			Admin.remove({_id:myID}, function(err, admin) {
				if (err) {
					utils.sendErrResponse(res, 400, 'Could not remove account');
				} else {
					utils.sendSuccessResponse(res, admin);
				}
			});
		}
	});
});

/*
	GET /admin/check - return a JSON object for important session data.
*/
router.get('/check', function(req, res) {
	utils.sendSuccessResponse(res, {name: req.session.name, id: req.session.userId, type: req.session.type});
});

/*
	PUT /admin/logout - logs out a user and clears session cookies
	Returns: 
	String: 'Successfully logged out.' or 'Already logged out.'
*/
router.put('/logout', function(req, res) {
	if (req.session.name) {
		req.session.name = null;
		req.session.userId = null;
		req.session.type = null;
		utils.sendSuccessResponse(res, 'Successfully logged out.');
	} else {
		utils.sendSuccessResponse(res, 'Already logged out.');
	}
});

module.exports = router;