var Rule = require('../models/rule').Rule;
var Appointment = require('../models/appointment').Appointment;
var Guest = require('../models/guest').Guest;
var Admin = require('../models/admin').Admin;

exports.testDev = function(req, res){
	Rule.find().exec(function(err, appointments){console.log(appointments)})
	/*Guest.find().remove().exec()*/
/*	birthday = new Date(1995, 4, 23);
	beginningOftime = new Date (1950, 1, 1);
	(new Guest({firstName: 'TRICIA', lastName: 'SHI', birthday: birthday, lastVisit: beginningOftime})).save();*/
/*	Guest.find().exec(function(err, guests){console.log(guests)})
	Rule.find().exec(function(err, rules){console.log(rules)})
	Admin.find().exec(function(err, admin){console.log(admin)})*/
/*	yesterday = new Date(2015, 0, 24);
	birthday = new Date(1995, 4, 23);
	var data = {
	date: yesterday,
	timeslot: ['9:00', '10:00'], 
	firstName: 'TRICIA',
	lastName: 'SHI',
	birthday: birthday,
	premade: false,
	waitlist: false
	};
	blarth = new Appointment(data);
	blarth.save();*/

/*	user = {
		username: 'admin',
		password: '12345',
		type: 'administrator'
	};

	new Admin(user).save();

	(new Admin({username: 'Admin', password: '12345', type: 'administrator'})).save();*/
	res.render('error');
}

exports.createDefaultRules = function(req, res){
	console.log("creating rules");
	var possibleTimes = [['9:00', '10:00'], ['10:00', '11:00'], ['11:00', '12:00'], ['16:30', '17:30'], ['17:30', '18:30']];
	var daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday','Sunday'];
	for(var i = 0; i < daysOfWeek.length; i++){
		if(i==0){
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
		}
		else{
			for(var j = 0; j < possibleTimes.length; j++){
				if(j <= 1){
					cap = 27;
				}
				else if(j == 2){
					cap = 26;
				}
				else{
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
	Rule.find().exec(function(err, rules){console.log(rules)})
	res.render('error');
};

