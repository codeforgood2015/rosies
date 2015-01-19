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

//get default times for monday...sunday
router.get('/default/monday', function(req, res) {
	//get and return list of monday's times and capacities
	//TODO check the format of dates
	Rule.find({date: "Monday"}, function(err, rule) {
		//TODO: look into the rule and get out the times and capacities only, send them as an array
		if (err) {
			utsils.sendErrResponse(res, 404, err);
		} else {
			utils.sendSuccessResponse(res, rule);
		}
	});
});
//repeat for tuesday through sunday


//get all special hours
router.get('/special', function(req, res) {
	//get and return list of special dates with their timeslots capacities, order dates from earliest to latest
});

//get all guests on (day, time) specified
router.get('/special/timeslot', )

/*****************/
/* POST Requests */
/*****************/

//new special hours rule 
router.post('/special/new', function(req, res) {

});

/****************/
/* PUT Requests */
/****************/

//edit default hour for monday...sunday
router.put('/default/edit', function(req, res) {

});

//edit special hours rule
router.put('/special/edit', function(req, res) {

});

/*******************/
/* DELETE Requests */
/*******************/

//remove special hours rule
router.put('/special/delete', function(req, res) {

});


/* Export */
module.exports = router;
