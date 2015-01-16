var express = require('express');
var router = express.Router();
var Appointment = require('../models/appointment').Appointment;
var Rule = require('../models/rule').Rule;
var utils = require('../utils/utils');
var moment = require('moment');

// GET /appointments - get all appointments
// TODO: should check that an admin is logged in
router.get('/', function(req, res) {
	Appointment.find({}, function(err, appointments) {
		utils.sendSuccessResponse(res, appointments);
	});
});

/*
	POST /appointments: create a new appointment
	Request body:
	- date: Date object representing the day of appointment
	- timeslot: Array of Strings representing the time interval of appointment
	- firstName, lastName: Strings identifying the guest
	- birthday: Guest's birthday, as a String
	- premade: boolean representing whether a premade bag is accepted
*/
router.post('/', function(req, res) {
	var data = {
		date: req.body.date,
		timeslot: req.body.timeslot,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		birthday: req.body.birthday,
		premade: req.body.premade,
		//allergies: req.body.allergies
	}; 
	Appointment.find({date: data.date, timeslot: data.timeslot}, function(err, appointments) {
		// TODO: check if user has already made an appointment
		// TODO: fetch number of allotted slots
		
		if (appointments.length < 27) {
			data.waitlist = false;
			var appointment = new Appointment(data);
			appointment.save(function(err) {
				utils.sendSuccessResponse(res, appointment);
			});
		} else if (appointments.length < 30) {
			data.waitlist = true;
			appointment = new Appointment(data);
			appointment.save(function(err) {
				utils.sendSuccessResponse(res, appointment);
			});
		} else {
			res.sendErrResponse(res, 403, 'This timeslot is filled.');
		}
	});
});

/*
	GET /:time - given an input time as a URL param, return status of timeslot
	Request body/Parameters:
	- time: Any string that can be parsed by moment, as defined at momentjs.com
	Returns
	- status: a string taking on the states 'open', 'closed', or 'waitlist'
*/
router.get('/:time', function(req, res) {
	var dateObj = moment(req.params.time);
	var month = dateObj.month();
	var day = dateObj.date();
	var year = dateObj.year();
	var data = {
		date: new Date(year, month, day),
		timeslot: dateObj.hour() + ':' + dateObj.minute()
	}
	checkTime(data, function(err, status) {
		if (err) {
			utils.sendErrResponse(res, 403, err);
		} else {
			utils.sendSuccessResponse(res, status);
		}
	});
});

/*
	Given a JSON object (data), check whether the timeslot is open
    Executes callback(err, status)
    	err - error, typically occurs if a data entry is null
    	status - String, one of 'open', 'waitlist', or 'closed'
*/
var checkTime = function(data, callback) {
	Appointment.find({
		date: data.date, 
		timeslot: data.timeslot
	}, function(err, appointments) {
		//TODO: fix these queries, they need to include timeslots
		Rule.find({date: data.date}, function(err, rules) {
			if (rules.length == 0) {
				Rule.findOne({date: data.date.getDay()}, function(err, rule) {
					callback(err, checkRule(appointments.length, rule));
				});
			} else {
				callback(err, checkRule(appointments.length, rules[0]));
			}
		});
	});
};

/*
	Helper function that compares the number of appointments to a rule,
	Returns - String, one of 'open', 'waitlist', or 'closed' depending 
	    status of the timeslot
*/
var checkRule = function(num_appts, rule) {
	if (num_appts < rule.maxCap) {
		return 'open';
	} else if (num_appts < rule.maxCap + rule.maxWaitlist) {
		return 'waitlist';
	} else {
		return 'closed';
	}
};

// GET /:id - return json of appointment using its id 
router.get('/:id', function(req, res) {
	Appointment.findById(req.params.id, function(err, appointment) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, appointment);
		}
	});
});

/*
	PUT /:id - modify details of an appointment based on its id
	Request body:
	- date: Date object representing a changed appointment time
	- premade: boolean for new 
*/
router.put('/:id', function(req, res) {
	Appointment.findById(req.params.id, function(err, appointment) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			appointment.date = req.body.date;
			appointment.premade = req.body.premade;
			appointment.save(function(err) {
				utils.sendSuccessResponse(res, appointment);
			});
		}
	});
});

//TODO: Check that the signed-in user is the one deleting the appointment
router.delete('/id', function(req, res) {
	Appointment.remove({id: req.params.id}, function(err, appointment) {
		if (err) {
			utils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, appointment);
		}
	});
});

module.exports = router;