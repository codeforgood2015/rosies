var express = require('express');
var router = express.Router();
var Rule = require('../models/rule').Rule;
var Appointment = require('../models/appointment').Appointment;
var utils = require('../utils/utils');
var moment = require('moment'); //for parsing and handling dates

var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/*
	GET /default - returns all default hours for days of the week
	Returns
	- rules: Array of rule Documents
*/
router.get('/default', function(req, res) {
	Rule.find({date: {$in: daysOfWeek}}, function(err, rules) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rules);
		}
	});
});

/*
	GET /default/:day - given an input day as a URL param, return all rules associated
	    with that day of week by default
	Request body/Parameters:
	- day: String, must be one of "Monday", "Tuesday", etc.
	Returns
	- rules: Array of rule Documents
*/
router.get('/default/:day', function(req, res) {
	if (daysOfWeek.indexOf(req.params.day) == -1) {
		utils.sendErrResponse(res, 400, 'Input string was not a day of the week.');
	} else {
		Rule.find({date: req.params.day})
		.sort({time: 1})
		.exec(function(err, rules) {
			if (err) {
				utils.sendErrResponse(res, 404, err);
			} else {
				utils.sendSuccessResponse(res, rules);
			}
		});
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
	Rule.find({date: {$nin: daysOfWeek}})
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
	- time: Array of Strings representing start and end time of the timeslot as HH:MM in military time
	- date: String representing day for the rule, in YYYY-MM-DD format
	- repeat: boolean representing whether the rule should repeat.
	Returns
	- rule: newly created rule
*/
router.post('/special/', function(req, res) {
	var data = {
		maxCap: req.body.maxCap,
		maxWaitlist: req.body.maxWaitlist,
		time: req.body.time,
		date: req.body.date,
		repeat: req.body.repeat,
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
	Rule.find({date: req.params.date}, function(err, rules) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rules);
		}
	});
});

/*
	GET /:id - return rule associated with a particular ObjectId
	Request Body/Parameters
	- id: Object ID of rule to return
	Returns
	- rule: rule Documents
*/
router.get('/:id', function(req, res) {
	Rule.findById(req.params.id, function(err, rule) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rule);
		}
	});
});

/*
	PUT /:id - given the ID for a rule as a parameter, modify the rule according to the 
		request body.
	NOTE: This method does not allow for the date to be edited, modifications to dates should be 
		represented by new rules. This allows editing of rules for an existing date
	Request body/Parameters:
	- maxCap: number representing maximum capacity of the timeslot
	- maxWaitlist: number representing maximum waitlist capacity
	- time: Array of Strings representing start and end time of the timeslot as HH:MM in military time
	- repeat: boolean representing whether the rule should repeat.
	Returns
	- rule: the modified rule document
*/
router.put('/:id', function(req, res) {
	var data = {
		maxCap: req.body.maxCap,
		maxWaitlist: req.body.maxWaitlist,
		time: req.body.time,
		repeat: req.body.repeat
	};
	Rule.findById(req.params.id, function(err, rule) {
		for (var key in data) {
			if (data[key]) {
				rule[key] = data[key];
			}
		}
		rule.save(function(err) {
			if (err) {
				utils.sendErrResponse(res, 404, err);
			} else {
				utils.sendSuccessResponse(res, rule);
			}
		})
	})
});

/*
	DELETE /:id - Remove the rules specified by the Object ID
	Returns
	- rule: the deleted rule document
*/
router.delete('/:id', function(req, res) {
	Rule.remove({id: req.params.id}, function(err, rule) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rule);
		}
	});
});

/* Export */
module.exports = router;
