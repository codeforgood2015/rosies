var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var http = require('http');
var Agenda = require('agenda');
var Rule = require('./models/rule').Rule;
var Timeslot = require('./models/timeslot').Timeslot;

var mongoose = require('mongoose');
var connection_string = 'localhost/rosies';

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + process.env.OPENSHIFT_APP_NAME;
}
mongoose.connect(connection_string);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	// create the default rules if they don't exist
	Rule.find({}, function(err, rules) {
		if (rules.length == 0) {
			createDefaultRules();
		}
	})
});

var createDefaultRules = function() {
	var possibleTimes = [['9:00', '10:00'], ['10:00', '11:00'], ['11:00', '12:00'], ['16:30', '17:30'], ['17:30', '18:30']];
	var daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];
	for(var i = 0; i < daysOfWeek.length; i++){
		if (i==0) {
			//if it's Monday, only do afternoon times
			for(var j = 3; j < possibleTimes.length; j++){
				(new Rule({
					'maxCap': 20, 
					'maxWaitlist': 2, 
					'time': possibleTimes[j], 
					'date': daysOfWeek[i], 
					'repeat': false
				})).save();
				console.log(possibleTimes[j]);
			}
		} else {
			for(var j = 0; j < possibleTimes.length; j++){
				if (j <= 1) {
					cap = 27;
				} else if(j == 2){
					cap = 26;
				} else {
					cap = 20;
				}
				(new Rule({
					'maxCap': cap, 
					'maxWaitlist': 2, 
					'time': possibleTimes[j], 
					'date': daysOfWeek[i], 
					'repeat': false
				})).save();
				console.log(possibleTimes[j]);
			}
		}
	}
/*	Rule.find().exec(function(err, rules){console.log(rules)})
	res.render('error');*/
}

// set up agenda in order to schedule jobs
var agenda = new Agenda({
	db: {
		address: connection_string,
		collection: 'agendaJobs'
	}
});
// job processors


agenda.define('update timeslots', function(job, done) {
	console.log("got here 0");
	var today = new Date(Date.now());
	var yesterday = new Date(Date.now() - 1000*60*60*24);
	var tomorrow = new Date(Date.now() + 1000*60*60*24);
	var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	//console.log("got here 1");
	//delete yesterday's timeslots
	Timeslot.find({dayOfWeek: weekdays[yesterday.getDay()]}).exec(function(err, timeslots){
		if(!err && timeslots.length > 0){
			Timeslot.find({dayOfWeek: weekdays[yesterday.getDay()]}).remove().exec()
		}
	})
	//create today's timeslots if they're not there
	//right now only searches for the weekly timeslots
	Timeslot.find({dayOfWeek: weekdays[today.getDay()]}).exec(function(err, timeslots){
		if(!err && timeslots.length == 0){
			console.log("why are these missing, creating today's dates anyways");
			Rule.find({date: weekdays[today.getDay()]}).exec(function(err, rules){
				if(err || !rules || rules.length == 0){
					console.log("uhoh")
				}
				else{
					for(var i = 0; i < rules.length; i++){
						timeslot = new Timeslot({
							dayOfWeek: weekdays[today.getDay()],
							date: today,
							time: rules[i].time,
							maxCapacity: rules[i].maxCap,
							maxWaitlist: rules[i].maxWaitlist,
							guests: [],
							waitlist: []
						});
						timeslot.save();
					}
				}
			})
		}
	})

	//create today's timeslots if they're not there
	//right now only searches for the weekly timeslots
	Timeslot.find({dayOfWeek: weekdays[tomorrow.getDay()]}).exec(function(err, timeslots){
		if(!err && timeslots.length == 0){
			console.log("creating tomorrow's slots");
			Rule.find({date: weekdays[tomorrow.getDay()]}).exec(function(err, rules){
				if(err || !rules || rules.length == 0){
					console.log("uhoh")
				}
				else{
					for(var i = 0; i < rules.length; i++){
						timeslot = new Timeslot({
							dayOfWeek: weekdays[tomorrow.getDay()],
							date: today,
							time: rules[i].time,
							maxCapacity: rules[i].maxCap,
							maxWaitlist: rules[i].maxWaitlist,
							guests: [],
							waitlist: []
						});
						timeslot.save();
					}
				}
			})
		}
	})

	//console.log("got here 3");
	//remove events if they were no repeat
 	//not implemented yet
 	//Timeslot.find().exec(function(err, timeslots){console.log(timeslots)})
 	//console.log("got here 4");
 	done();  

});

//cron format: minute, hour, dayOfMonth, monthOfYear, dayOfWeek, Year, * means any
agenda.every('10 seconds', 'update timeslots');
agenda.on('fail', function(err, job){
	console.log(err.message)
})
agenda.start();

console.log("starting");

// routes for the app
var auth = require('./routes/auth');
var admin = require('./routes/admin');
var dev = require('./routes/dev');
var appointments = require('./routes/appointments');

var app = express();

app.set('port', process.env.PORT || 3000);

// setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/auth', auth);
app.get('/dev', dev.testDev);
//app.get('/dev/set', dev.createDefaultRules);
app.use('/admin', admin);
app.use('/appointments', appointments);

app.get('/', function(req, res) {
	res.render('NewReservation')
});

/*var checkLogin = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.render('NewReservation');
	}
};*/
module.exports = app;