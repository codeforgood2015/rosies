var express = require('express');
var router = express.Router();
var https = require('https');

var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

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

router.get('/oauth', passport.authenticate('oauth'));

router.get('/oauth/callback', passport.authenticate('oauth', {successRedirect: '/', failureRedirect: '/'}));

module.exports = router;