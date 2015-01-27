var express = require('express');
var router = express.Router();
var https = require('https');
var passport = require('passport');
var utils = require('../utils/utils');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;
var Guest = require('../models/guest').Guest;
var Appointment = require('../models/appointment').Appointment;

// Once we figure our how to get Salesforce working, we should
// use a module other than passport to authenticate with OAuth2,
// since we don't really want to serialize a session based on this
passport.use('oauth', new OAuth2Strategy({
	authorizationURL: 'https://login.salesforce.com/services/oauth2/authorize',
	tokenURL: 'https://login.salesforce.com/services/oauth2/token',
	clientID: '3MVG9fMtCkV6eLhd3UV9YJktlWf00iTFSu_iiJQMDpceLE6D3exHtSd0hXW_EiE.O3kB8q.8SYV34OFc87XWJ',
	clientSecret: '3359928367370495608',
	callbackURL: 'http://localhost:8080/auth/oauth/callback'
}, function(accessToken, refreshToken, profile, done) {
	// Create or find user then call done
	console.log('token acquired');
}));

// until we get Salesforce working, create a local strategy for
// authenticating users with accounts in our database.
// Note that we need two authentication flows for admins compared to guests
/*passport.use('guest', new LocalStrategy(function(username, password, done) {
	console.log('authenticating');
	//for now, make all usernames uppercase because otherwise things are sad :(
	username.toUpperCase();
	Guest.findOne({username: username}, function(err, guest) {
		if (err) {
			return done(err);
		} if (!guest) {
			console.log('Trying to create new user');
			var guest = new Guest({username: username, password: password});
			guest.save();
			return done(null, false, {message: 'New user created, retry login.'});
		} if (!guest.validPassword(password)) {
			return done(null, false, {message: 'Incorrect password.'});
		}
		return done(null, guest);
	});
}));*/

passport.use('admin', new LocalStrategy(function(username, password, done) {
	console.log('test');
	Admin.findOne({username: username}, function(err, admin) {
		if (err) {
			return done(err);
		} if (!guest) {
			return done(null, false, {message: 'Incorrect username.'});
		} 
		bcrypt.compare(password, admin.password, function(err, result) {
			if (result) {
				return done(null, admin);
			} else {
				return done(null, false, {message: 'Incorrect password.'});
			}
		});
	})
}));

router.get('/oauth', passport.authenticate('oauth'));

router.get('/oauth/callback', passport.authenticate('oauth', {successRedirect: '/', failureRedirect: '/'}));

/*
router.post('/guest/login', passport.authenticate('guest', {successRedirect: '/', failureRedirect: '/test', failureFlash: false}));

// once we get Salesforce working, this should be removed as well.
router.post('/guest', function(req, res) {
	var data = {
		username: req.body.username,
		password: req.body.password
	};
	var guest = new Guest(data);
	guest.save(function(err) {
		utils.sendSuccessResponse(res, 'New user created');
	});
});*/
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

router.post('/guest', function(req, res) {
	birthday = new Date(req.body.dob.year, req.body.dob.month, req.body.dob.day);
	console.log(birthday)
	var data = {
		firstName: req.body.firstName.toUpperCase(),
		lastName: req.body.lastName.toUpperCase(),
		birthday: birthday
	};
	Guest.findOne(data, function(err, guest){
		if(err){
			utils.sendErrResponse(res, 403, err);
		}
		else if(!guest){
			utils.sendSuccessResponse(res, {available: 'notFound'});
		}
		else{
			checkUser(data, function(err, status) {
				if (err) {
					utils.sendErrResponse(res, 403, err);
				} else {
					console.log('sending success')
					console.log(status)
					utils.sendSuccessResponse(res, {available: status});
				}
			});
		}
	})
});

router.get('/guest', function(req, res) {
	// TODO: render login view
});


var checkUser = function(data, callback) {
	console.log(data)
	Appointment.findOne(data, function(err, appointment) {
		console.log(appointment)
		if (appointment) {
			callback(err, [appointment.date.getTime(), appointment.timeslot, appointment.waitlist]);
		} else {
			callback(err, true);
		}
	});
};

// Clears the session
router.get('/logout', function(req, res) {
	// This avoids bugs with Passport's req.logout()
	req.session.destroy(function(err) {
		res.redirect('/');
	});
});

module.exports = router;