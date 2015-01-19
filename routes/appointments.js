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
	- waitlist: boolean representing whether this is a waitlisted array
*/
router.post('/', function(req, res) {
	fixedDate = new Date(req.body.date);
	var data = {
		date: fixedDate,
		timeslot: req.body.timeslot,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		birthday: req.body.birthday,
		premade: req.body.premade,
		waitlist: req.body.waitlist
		//allergies: req.body.allergies
	}; 
	console.log(typeof data.date);
	Rule.findOne({date: dayString(data.date.getDay()), time: data.timeslot}, function(err, rule){
		if(err){
			console.log(err)
		}
		else if(!rule){
			console.log("doesn't fit a rule");
			res.render('NewReservation');
		}
		else{
			console.log(rule);
			Appointment.find({date: data.date, timeslot: data.timeslot}, function(err, appointments) {
			// TODO: check if user has already made an appointment
			// TODO: fetch number of allotted slots
			// TODO: add this appointment to the timeslot
			if (err){
				console.log(err)
			}
			else if (appointments.length < rule.maxCap) {
				data.waitlist = false;
				var appointment = new Appointment(data);
				appointment.save(function(err) {
					utils.sendSuccessResponse(res, appointment);
				});
			} else if (appointments.length < rule.maxCap + rule.maxWaitlist) {
				data.waitlist = true;
				appointment = new Appointment(data);
				appointment.save(function(err) {
					utils.sendSuccessResponse(res, appointment);
				});
			} else {
				res.sendErrResponse(res, 403, 'This timeslot is filled.');
			}
	});
		}
	})
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
	};
	checkTime(data, function(err, status) {
		if (err) {
			utils.sendErrResponse(res, 403, err);
		} else {
			utils.sendSuccessResponse(res, status);
		}
	});
});

router.put('/time', function(req, res) {
	var data = {
		date: req.body.date,
		timeslot: req.body.timeslot
	};
	Appointment.find(data, function(err, apps) {
		if (err) {
			utils.sendErrResponse(res, 403, err);
		} else {
			utils.sendSuccessResponse(res, apps);
		}
	});
});

/*
	Given a JSON object, check whether the timeslot is open
	Arguments:
	- data.date: Date object representing the relevant day at 0:00
	- data.timeslot: Array representing time interval for the slot
    Executes callback(err, status)
    - err: error, typically occurs if a data entry is null
    - status: String, one of 'open', 'waitlist', or 'closed'
*/
var checkTime = function(data, callback) {
	Appointment.find({
		date: data.date, 
		timeslot: data.timeslot
	}, function(err, appointments) {
		Rule.find({date: data.date, timeslot: data.timeslot}, function(err, rules) {
			if (rules.length == 0) {
				Rule.findOne({date: dayString(data.date.getDay()), timeslot: data.timeslot}, function(err, rule) {
					if (rule) {
						callback(err, checkRule(appointments.length, rule));
					} else {
						callback(err, 'closed');
					}
				});
			} else {
				callback(err, checkRule(appointments.length, rules[0]));
			}
		});
	});
};

var dayString = function(day) {
	switch (day) {
		case 0:
			return 'Sunday';
		case 1:
			return 'Monday';
		case 2:
			return 'Tuesday';
		case 3:
			return 'Wednesday';
		case 4:
			return 'Thursday';
		case 5:
			return 'Friday';
		case 6:
			return 'Saturday';
	}
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

/*
	GET /:id - return json of appointment using its id 
	Request body/parameters:
	- id: ObjectId of the appointment to be returned
*/
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