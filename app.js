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
	var today = new Date(Date.now());
	var yesterday = new Date(Date.now() - 1000*60*60*24);
	var tomorrow = new Date(Date.now() + 1000*60*60*24);
	var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	//console.log("got here 1");
	//delete yesterday's appointments
	Appointment.find({dayOfWeek: weekdays[yesterday.getDay()]})
	.exec(function(err, appointments){
		if(!err && appointments.length > 0){
			Appointment.find({dayOfWeek: weekdays[yesterday.getDay()]}).remove().exec()
		}
	})
 	done();
});

//cron format: minute, hour, dayOfMonth, monthOfYear, dayOfWeek, Year, * means any
agenda.every('10 minutes', 'prune appointments');
agenda.on('fail', function(err, job){
	console.log(err.message)
})
agenda.start();

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

/*var checkLogin = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		res.render('NewReservation');
	}
};*/
module.exports = app;