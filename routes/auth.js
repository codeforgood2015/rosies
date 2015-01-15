var express = require('express');
var router = express.Router();
var https = require('https');
var passport = require('passport');
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
passport.use('guest', new LocalStrategy(function(username, password, done) {
	Guest.findOne({username: username}, function(err, guest) {
		if (err) {
			return done(err);
		} if (!guest) {
			return done(null, false, {message: 'Incorrect username.'});
		} if (!guest.validPassword(password)) {
			return done(null, false, {message: 'Incorrect password.'});
		}
		return done(null, guest);
	});
}));

passport.use('admin', new LocalStrategy(function(username, password, done) {
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

// TODO: set a different failure redirect as needed
router.put('/guest', passport.authenticate('guest', {successRedirect: '/', failureRedirect: '/', failureFlash: true}));

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
});

router.get('/guest', function(req, res) {
	// TODO: render login view
});


var checkUser = function(data, callback) {
	Appointment.find({
		firstName: data.firstName,
		lastName: data.lastName,
		birthday: data.birthday
	}, function(err, appointments) {
		if (appointments.length > 0) {
			callback(err, false);
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