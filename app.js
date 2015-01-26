var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var http = require('http');
var Agenda = require('agenda');
var Rule = require('./models/rule').Rule;
var Appointment = require('./models/appointment').Appointment;
var utils = require('./utils/utils');

// handle the mongoose database
var mongoose = require('mongoose');
var connection_string = 'localhost/rosies';
// OpenShift uses these for their Mongo instance
if (process.env.OPENSHIFT_MONGODB_DB_USERNAMEODB_DB_PASSWORD) {
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
	// Rosie's Place currently has operating hours of 9:00-12:00, 16:30-18:30 every day
	// with only afternoon hours for Mondays. These are the default hours for the app.
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
			}
		} else {
			for(var j = 0; j < possibleTimes.length; j++){
				if (j <= 1) {
					cap = 27;
				} else if (j == 2) {
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
			}
		}
	}
}

// set up agenda in order to schedule jobs
var agenda = new Agenda({
	db: {
		address: connection_string,
		collection: 'agendaJobs'
	}
});

// job processors
agenda.define('prune appointments', function(job, done) {
	var today = utils.midnightDate(new Date(Date.now()));
	Appointment.remove({
		date: {$lt: today}
	}, function(err) {
		if (err) {
			console.log(err);
		}
	});
 	done();
});

//cron format: minute, hour, dayOfMonth, monthOfYear, dayOfWeek, Year, * means any
agenda.schedule('1 second', 'prune appointments');
agenda.on('fail', function(err, job){
	console.log(err.message)
})
agenda.start();

console.log("starting")

// routes for the app
var auth = require('./routes/auth');
var admin = require('./routes/admin');
var dev = require('./routes/dev');
var appointments = require('./routes/appointments');
var rules = require('./routes/rules');
var guest = require('./routes/guest');

var app = express();

app.set('port', process.env.PORT || 3000);

// setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

app.use(cookieParser());
app.use(session({
	secret: "rosie's place",
	resave: false,
	saveUninitialized: true,
	store: new MongoStore({
		mongooseConnection: mongoose.connection
	})
}));

app.use('/auth', auth);
app.get('/dev', dev.testDev);
//app.get('/dev/set', dev.createDefaultRules);
app.use('/admin', admin);
app.use('/appointments', appointments);
app.use('/rules', rules);
app.use('/guest', guest);

app.get('/', function(req, res) {
	res.render('NewReservation')
});

app.get('/splash', function(req, res){
	res.render('splash')
});

module.exports = app;