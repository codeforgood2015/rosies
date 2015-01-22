var express = require('express');
var router = express.Router();
var Rule = require('../models/rule').Rule;
var Appointment = require('../models/appointment').Appointment;
var Timeslot = require('../models/timeslot').Timeslot;
var utils = require('../utils/utils');
var moment = require('moment'); //for parsing and handling dates

/****************/
/* GET Requests */
/****************/

/*
	GET /default/:day - given an input day as a URL param, return all rules associated
	    with that day of week by default
	Request body/Parameters:
	- day: String, must be one of "Monday", "Tuesday", etc.
	Returns
	- rules: Array of rule Documents
*/
router.get('/default/:day', function(req, res) {
	var daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	if (daysOfWeek.indexOf(req.params.day) == -1) {
		utils.sendErrResponse(res, 400, 'Input string was not a day of the week.');
	} else {
		Rule.find({date: req.params.day}, function(err, rules) {
			if (err) {
				utils.sendErrResponse(res, 404, err);
			} else {
				utils.sendSuccessResponse(res, rules);
			}
		})
	}
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
	GET /special/:date - returns special hours associated with the input date
	Request Body/Parameters
	- date: String representing a date, in YYYY-MM-DD format
	Returns
	- rules: Array of rule Documents
*/
router.get('/special/:date', function(req, res) {
	Rule.find({$and: [{type: false}, {date: req.params.date}], function(err, rules) {
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

// /*****************/
// /* POST Requests */
// /*****************/

// //new special hours rule 
// router.post('/special/new', function(req, res) {

// });

// /****************/
// /* PUT Requests */
// /****************/

// //edit default hour for monday...sunday
// router.put('/default/edit', function(req, res) {

// });

// //edit special hours rule
// router.put('/special/edit', function(req, res) {

// });

// /*******************/
// /* DELETE Requests */
// /*******************/

// //remove special hours rule
// router.put('/special/delete', function(req, res) {

// });


/* Export */
module.exports = router;
