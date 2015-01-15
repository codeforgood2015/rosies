var express = require('express');
var router = express.Router();
var Appointment = require('../models/appointment').Appointment;
var utils = require('../utils/utils');

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
	- date: Date object representing the start of the time slot
	- firstName, lastName: Strings identifying the guest
	- birthday: Guest's birthday, as a String
	- premade: boolean representing whether a premade bag is accepted
	- allergies: Array of Strings representing allergies
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
	Appointment.find({date: date}, function(err, appointments) {
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