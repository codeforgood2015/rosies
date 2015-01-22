var express = require('express');
var router = express.Router();
var Rule = require('../models/rule').Rule;
var Appointment = require('../models/appointment').Appointment;
var Timeslot = require('../models/timeslot').Timeslot;
var utils = require('../utils/utils');
var moment = require('moment'); //for parsing and handling dates

/*
	GET /default - returns all default hours for days of the week
	Returns
	- rules: Array of rule Documents
*/
router.get('/default', function(req, res) {
	Rule.find({type: true}, function(err, rules) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rules);
		}
	});
});

/*
	Helper function to avoid duplicating this code elsewhere. Given
	an input of a String, returns whether it is a day of the week.
*/
var checkDayOfWeek = function(day) {
	var daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	return (daysOfWeek.indexOf(req.params.day) == -1)
};

/*
	GET /default/:day - given an input day as a URL param, return all rules associated
	    with that day of week by default
	Request body/Parameters:
	- day: String, must be one of "Monday", "Tuesday", etc.
	Returns
	- rules: Array of rule Documents
*/
router.get('/default/:day', function(req, res) {
	if (checkDayOfWeek(req.params.day)) {
		utils.sendErrResponse(res, 400, 'Input string was not a day of the week.');
	} else {
		Rule.find({$and: [{type: true},{date: req.params.day}]}, function(err, rules) {
			if (err) {
				utils.sendErrResponse(res, 404, err);
			} else {
				utils.sendSuccessResponse(res, rules);
			}
		})
	}
});

/*
	PUT /default/:day - given an input day as a URL param, modify a rule associated
	    with that day of week by default
	Request body/Parameters:
	- day: String, must be one of "Monday", "Tuesday", etc.
	Returns
	- rules: Array of rule Documents
*/
router.put('/default/:day', function(req, res) {

});


/*
	GET /special - returns all special hours
	Returns
	- rules: Array of rule Documents
*/
router.get('/special', function(req, res) {
	//get and return list of special dates with their timeslots capacities, order dates from earliest to latest
	// TODO: check to make sure that this is appropriatelly sorted.
	Rule.find({type: false})
	.sort({date: 1})
	.exec(function(err, rules) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rules);
		}
	})
});

/*
	POST /special - create new special rule
	Request Body
	- maxCap: number representing maximum capacity of the timeslot
	- maxWaitlist: number representing maximum waitlist capacity
	- startTime: String representing start time of the timeslot as HH:MM in military time
	- duration: number representing the length of the timeslot in hours
	- date: String representing day for the rule, in YYYY-MM-DD format
	- repeat: boolean representing whether the rule should repeat.
	Returns
	- rule: newly created rule
*/
router.post('/special/', function(req, res) {
	var data = {
		maxCap: req.body.maxCap,
		maxWaitlist: req.body.maxWaitlist,
		startTime: req.body.startTime,
		duration: req.body.duration,
		date: req.body.date,
		repeat: req.body.repeat,
		type: false
	};
	var rule = new Rule(data);
	rule.save(function(err) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rule);
		}
	});
});

/*
	GET /special/:date - returns special hours associated with the input date
	Request Body/Parameters
	- date: String representing a date, in YYYY-MM-DD format
	Returns
	- rules: Array of rule Documents
*/
router.get('/special/:date', function(req, res) {
	Rule.find({$and: [{type: false}, {date: req.params.date}]}, function(err, rules) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rules);
		}
	});
});

/*
	GET /special/:date/:time - returns rule associated with a date and starting time
	Request Body/Parameters
	- date: String representing a date, in YYYY-MM-DD format
	- time: String representing a time, as HH:MM in military time
	Returns
	- rules: Array of rule Documents
*/
router.get('/special/timeslot', function(req, res) {
	Rule.find({$and: [{type: false}, {date: req.params.date}, {startTime: req.params.time}]}, function(err, rules) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rules);
		}
	});
});


//edit special hours rule
router.put('/special/edit', function(req, res) {

});

// /*******************/
// /* DELETE Requests */
// /*******************/

// //remove special hours rule
// router.put('/special/delete', function(req, res) {

// });


/* Export */
module.exports = router;
