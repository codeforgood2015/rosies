var express = require('express');
var router = express.Router();
var Appointment = require('../models/appointment').Appointment;
var Rule = require('../models/rule').Rule;
var utils = require('../utils/utils');
var moment = require('moment');
var _ = require('underscore');

/*
	GET /appointments: Return all appointments
*/
router.get('/', utils.checkVolunteer, function(req, res) {
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
	- birthday: Guest's birthday, as an Object with year, month, and day.
	- premade: boolean representing whether a premade bag is accepted
*/
router.post('/', function(req, res) {
	birthday = new Date(req.body.birthday.year, req.body.birthday.month, req.body.birthday.day);
	var data = {
		date: utils.midnightDate(new Date(req.body.date)), 
		timeslot: req.body.timeslot,
		firstName: req.body.firstName.toUpperCase(),
		lastName: req.body.lastName.toUpperCase(),
		birthday: birthday,
		premade: req.body.premade,
		waitlist: 0
	};
	dateToRules(data.date, data.timeslot, function(err, rules) {
		if (err) {
			console.log(err);
		} else if (!rules || rules == []) {
			utils.sendErrResponse(res, 401, 'Does not fit a rule.');
		} else {
			Appointment.find({
				firstName: data.firstName, 
				lastName: data.lastName, 
				birthday: data.birthday
			}, function(err, appointments) {
				if (appointments.length == 0) {
					checkTime(data, function(err, status) {
						if (err) {
							console.log(err);
						}
						switch(status) {
							case 'open':
								var appointment = new Appointment(data);
								appointment.save();
								utils.sendSuccessResponse(res, appointment);
								break;
							case 'waitlist':
								Appointment.find({$and: [{date: data.date}, {$not: {waitlist: 0}}]})
								.sort({waitlist: -1})
								.exec(function(err, appointments) {
									if (appointments) {
										data.waitlist = appointments[0].waitlist + 1;
									} else {
										data.waitlist = 1;
									}
									var appointment = new Appointment(data);
									appointment.save();
									utils.sendSuccessResponse(res, appointment);
								});
								break;
							case 'closed':
								utils.sendErrResponse(res, '401', 'This timeslot is filled.');
								break;
							default:
								utils.sendErrResponse(res, '404', 'This should never be reached.');
								break;
						}
					});
				} else {
					utils.sendErrResponse(res, 401, 'An appointment has already been made.');
				}
			});
		}
	});
});

/*
	GET /appointments/availability - return an array of times with their status
	Returns - 
		An array, times, such that times[0] represents the times for today and
		times[1] represents the times for tomorrow.
*/
router.get('/availability', function(req, res) {
	var today = utils.midnightDate(new Date(Date.now()));
	var tomorrow = utils.midnightDate(new Date(Date.now() + 1000*60*60*24));
	// fetch appropriate rule for today, checking special and default rules
	dateToRules(today, null, function(err, todRules) {
		if (err) {
			console.log(err);
		} else if (!todRules || todRules == []) {
			console.log('no rules found');
		} else {
			var timesToday = [];
			// this executes after the for loop below finishes. Necessary to avoid
			// asynchronous problems with querying Appointments in closedRules
			var fetchTomorrow = _.after(todRules.length, function() {
				dateToRules(tomorrow, null, function(err, tomRules) {
					if (err) {
						console.log(err);
					} else if (!tomRules || tomRules == []) {
						console.log('no rules found');
					} else {
						var timesTomorrow = [];
						var sendData = _.after(tomRules.length, function() {
							utils.sendSuccessResponse(res, [timesToday, timesTomorrow]);
						});
						for (var i = 0; i < tomRules.length; i++) {
							closedRules(tomRules[i], tomorrow, timesTomorrow, sendData);
						}
					}
				});
			});
			for (var i = 0; i < todRules.length; i++){
				closedRules(todRules[i], today, timesToday, fetchTomorrow);
			}
		}
	});
});

/*
	Helper function to populate the entries of an array with the availability of a day's timeslot
	Arguments:
	- myRule: rule object that is to be checked against
	- day: Date object representing the day the rule is for
	- times: Array to be populated by this method
	- callback: function(), to be executed in the main function calling this helper method.
*/
var closedRules = function(myRule, day, times, callback){
	Appointment.find({date: day, timeslot: myRule.time}, function(err, appointments){
		if (err || !appointments) {
			console.log(err);
		} else {
			times.push([myRule.time, checkRule(appointments.length, myRule)]);		
		}
		callback();
	});
};

/*
	Given a date object, returns the appropriate rules corresponding to the date.
		If there are no specific rules, then returns the default rules. The returned
		rules object is accessed through the callback.
	Arguments:
		dateObj: Javascript date object corresponding to the date to find rules for
		time: Array of Strings in military time (HH:MM) representing a specific rule to find
		callback: function(err, rules) 
		- err is non-null only when mongo throws an error
		- rules is an array of found rule objects
*/
var dateToRules = function(dateObj, time, callback) {
	var year = dateObj.getFullYear();
	var month = dateObj.getMonth() + 1;
	month = month >= 10 ? String(month) : '0' + String(month);
	var date = dateObj.getDate();
	date = date >= 10 ? String(date) : '0' + String(date);
	var dateString = year + '-' + month + '-' + date;
	if (time) {
		Rule.find({date: dateString, time: time}, function(err, rules) {
			if (rules.length == 0) {
				Rule.find({date: dayString(dateObj.getDay()), time:time}, function(err, defaultRules) {
					callback(err, defaultRules);
				});
			} else {
				callback(err, rules);
			}
		});
	} else {
		Rule.find({date: dateString}, function(err, rules) {
			if (rules.length == 0) {
				Rule.find({date: dayString(dateObj.getDay())}, function(err, defaultRules) {
					callback(err, defaultRules);
				});
			} else {
				callback(err, rules);
			}
		});
	}
};

/*
	POST /appointments/cancel - remove an appointment from the database based on person who scheduled it.
	Request body:
	- birthday: object with year, month, and day
	- firstName: first name of person to be removed
	- lastName: last name of person to be removed
*/
router.post('/cancel', function(req, res){
	birthday = new Date(req.body.birthday.year, req.body.birthday.month, req.body.birthday.day);
	var data = {
		firstName: req.body.firstName.toUpperCase(),
		lastName: req.body.lastName.toUpperCase(),
		birthday: birthday
	}
	Appointment.findOne(data, function(err, appointment) {
		var waitlist = appointment.waitlist;
		Appointment.remove(data, function() {
			Appointment.find({waitlist: {$gt: waitlist}}, function(err, appointments) {
				for (var i = 0; i < appointments.length; i++) {
					appointments[i].waitlist -= 1;
					appointments[i].save();
				}
				utils.sendSuccessResponse(res, 'Successfully canceled.');
			});
		});
	});
});

/*
	PUT /time - given an input date and timeslot, return appointments at that time
	Request body/Parameters:
	- date: a Date parseable string or object
	- timeslot: an array of strings in HH:MM military time
	Returns
	- apps: an array of appointments at the time.
*/
router.put('/time', utils.checkVolunteer, function(req, res) {
	var data = {
		date: utils.midnightDate(new Date(req.body.date)),
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
				Rule.findOne({date: dayString(data.date.getDay()), time: data.timeslot}, function(err, rule) {
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
	console.log(rule.maxCap);
	console.log(num_appts);
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

module.exports = router;