var express = require('express');
var router = express.Router();
var Guest = require('../models/guest').Guest;
var utils = require('../utils/utils');

router.post('/add', function(req, res) {
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	birthday = new Date(req.body.birthday.year, months.indexOf(req.body.birthday.month), req.body.birthday.day);
	lastVisit = new Date(1950, 1, 1);
	var data = {
		firstName: req.body.firstName.toUpperCase(),
		lastName: req.body.lastName.toUpperCase(),
		birthday: birthday,
	};
	Guest.find(data).exec(function(err, guests){
		if(err){
			utils.senderrResponse(res, 403, err)
		}
		else if(guests.length >0){
			utils.sendSuccessResponse(res, 'exists')
		}
		else{
			data[lastVisit] = lastVisit;
			(new Guest(data)).save();
			utils.sendSuccessResponse(res, 'done');
		}
	})
});

module.exports = router;
