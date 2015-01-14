var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var http = require('http');
var Agenda = require('agenda');
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

// ---------------------------------------------------------------

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

// routes for the app
var auth = require('./routes/auth');

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

app.get('/', function(req, res) {
	res.render('NewReservation');
});

module.exports = app;