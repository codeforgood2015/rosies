var Rule = require('../models/rule').Rule;

exports.testDev = function(req, res){
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
