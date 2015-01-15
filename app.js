var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var http = require('http');
var Agenda = require('agenda');
var Rule = require('./models/rule').Rule;
var Timeslot = require('./models/timeslot').model;

var mongoose = require('mongoose');
var connection_string = 'localhost/rosies';

// ------------------------------------------------------------
//based off of README.md on https://github.com/rschmukler/agenda
var agenda = new Agenda({db: {address: 'localhost:27017/agenda-example'}});


agenda.define('update timeslots', function(job, done) {
	var data = job.attrs.data;
 	done();  
});

agenda.every('midnight', 'update timeslots', {time: new Date(), capacity: Number, guests: Array, waitlist: Array});
agenda.start();

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + process.env.OPENSHIFT_APP_NAME;
}
mongoose.connect(connection_string);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function(callback) {});

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
	var yesterday = new Date(Date.now() - 1000*60*60*24);
	var tomorrow = new Date(Date.now() + 1000*60*60*24);
	console.log("got here 1");
	//delete yesterday's timeslots
	/*Timeslot.findAndModify({
		query: {dayOfWeek: yesterday.toLocaleDateString('en-US', {weekday: 'long'})},
		remove: true
	});*/
	//create tomorrow's timeslots
	//right now only searches for the weekly timeslots
	console.log("got here 2");
	Rule.find({day: 'Friday'}).exec(function(err, rules){
		console.log(err)
		if(err || !rules || rules.length == 0){
			console.log("uhoh")
		}
		else{
			console.log(rules);
			console.log("looking for rules");
			for(var i = 0; i <= rules.length; i++){
				timeslot = new Timeslot({
					dayOfWeek: tomorrow.toLocaleDateString('en-US', {weekday: 'long'}),
					date: tomorrow,
					time: rules[i].time,
					maxCapacity: rules[i].maxCap,
					maxWaitlist: rules[i].maxWaitlist,
					guests: [],
					waitlist: []
				})
			}
		}
	})
	console.log("got here 3");
	//remove events if they were no repeat
 	//not implemented yet
 	Timeslot.find().exec(function(err, timeslots){console.log(timeslots)})
 	console.log("got here 4");
 	done();  
});
//cron format: minute, hour, dayOfMonth, monthOfYear, dayOfWeek, Year, * means any
//currently every day at 12:01AM
agenda.schedule('in 2 seconds', 'update timeslots');
agenda.start();

// routes for the app
var auth = require('./routes/auth');
var admin = require('./routes/admin');

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

app.get('/admin', function(req, res) {
	res.render('admintest')
});

app.get('/', function(req, res) {
	res.render('NewReservation');
});

module.exports = app;