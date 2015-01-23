/**************************/
/*INCLUSIVE RANGE FUNCTION*/
/**************************/

var range = function(start, end, up){
	result = [];
	if (up === 1){
		for(var i = start; i <= end; i++){
		result.push(i);
	}
	}
	else{
		for(var i = end; i >= start; i--){
		result.push(i)
		}
	};
	return result
};

/****************************/
/*WRAPPER FOR THE CONTROLLER*/
/****************************/

(function(){
	var app = angular.module('dateTime', []);
app.controller('LoginController', function($scope, $http){
	

});
		
app.controller('datetimeController', function($scope, $http){
	var me = this;
	$scope.currentSelect = -1;
	this.attempted = false;
	$scope.submitSuccess = false;
	$scope.timeSlots = [['9:00 am to 10:00 am', '10:00 am  to 11:00 am', '11:00 am to 12:00 noon', '4:30 pm to 5:30 pm', '5:30 pm to 6:30 pm'],['9:00 am to 10:00 am', '10:00 am  to 11:00 am', '11:00 am to 12:00 noon', '4:30 pm to 5:30 pm', '5:30 pm to 6:30 pm']];
	this.dateIndex = 0;
	this.timeSelect = ['not Selected', ''];


	//CLEARS ALL USER DATA AND SETS ALL BACK TO DEFAULTS
	//CALLED ON EXIT BUTTON AND ON HITTING BACK TO THE FRONT PAGE
	this.reset = function(){
		$scope.currentSelect = -1;
		$scope.user = {};
		this.dateSelect = '';
		this.timeSelect = '';
		this.bag = '';
		this.attempted = false;
	}

	//STEPS THE PAGE FORWARD LINEARLY
	//CALLED ON MOST BUTTONS
	this.next = function(){
		$scope.currentSelect += 1;
	};

	//STEPS THE PAGE BACKWARD LINEARLY
	//CALLED ON THE BACK BUTTON
	this.back = function(){
		$scope.currentSelect -= 1;
		if($scope.currentSelect == -1){
			this.reset();
		}
	};

	//GUEST LOGIN FUNCTION
	//VALIDATES THAT ALL OF THE ENTRIES ARE FILLED
	//IF THEY ARE, CHECK DATABASE FOR THE USER
	//IF THE USER IS VALID, GET THE LATEST TIMESLOT AVAILABILITY
	this.lookup = function(user){
		console.log(user);
		if(user && user.firstName && user.lastName && user.dob && user.dob.year && user.dob.month && user.dob.day){
			$http.post('/auth/guest', {
				firstName: user.firstName,
				lastName: user.lastName,
				dob: user.dob
			}).success(function(data, status, headers, config){
				if (data.content.available) {
					$scope.currentSelect +=1;
					$scope.submitSuccess = false;
					$http.post('/appointments/availability').success(function(data, status, headers, config){
						$scope.timeSlots = [];
						$scope.timeSlots[0] = data[0];
						$scope.timeSlots[0].sort(function(a, b){
							var atemp = a[0][0].split(':');
							var btemp = b[0][0].split(':');
							console.log(atemp[0], btemp[0])
							return Number(atemp[0]) - Number(btemp[0])
						});
						$scope.timeSlots[1] = data[1];
						$scope.timeSlots[1].sort(function(a, b){
							var atemp = a[0][0].split(':');
							var btemp = b[0][0].split(':');
							console.log(atemp[0], btemp[0])
							return Number(atemp[0]) - Number(btemp[0])
						});

					}).error(function(data, status, headers, config){
					})
				} else {
					console.log(data)
					alert('You have an appointment!');
				}
			}).error(function(data, status, headers, config){
				console.log(status)
			});
		} else {
			this.attempted = true;
			console.log("uhoh")
		}
	};

	//HELPER FUNCTION FOR BUTTON RENDERING
	//changes an array [String, String] where strings are times in military time
	//to a readable string 'TIME TO TIME'
	this.timeArrayToString = function(timeArray){
		start = timeArray[0].split(':');
		end = timeArray[1].split(':');
		if(Number(start[0]) > 12){
			start[0] = Number(start[0]) - 12;
			start[0] = String(start[0]);
			start[2] = 'PM';
		}
		else if (Number(start[0]) == 12){
			start[2] = 'PM'
		}
		else{
			start[2] = 'AM';
		}
		if(Number(end[0]) > 12){
			end[0] = Number(end[0]) - 12;
			end[0] = String(end[0]);
			end[2] = 'PM';
		}
		else if (Number(end[0]) == 12){
			end[2] = 'PM';
		}
		else{
			end[2] = 'AM';
		}
		return(start[0] + ':' + start[1] + ' ' + start[2] + ' to ' + end[0] + ':' + end[1] + ' ' + end[2])
	};

	//helper function to close buttons
	//first sets all timeslots that have passed to closed
	//then disables all closed buttons
	//timeArray = [[start, end], status]
	this.disableClosed = function(timeArray){

	if(me.dateIndex == 0){
			end = timeArray[0][1].split(':');
			rightNow = new Date(Date.now());
			if((end[0] < rightNow.getHours() || (end[0] == rightNow.getHours() && end[1] < rightNow.getMinutes()))|| timeArray[1] == 'closed'){
				timeArray[1] = 'closed';
				return true;
			}
		}


		//$(".closed").prop('disabled', true);
		//$(".closed").prop('ng-click', '');
		return false;
	};

	//binds date to button click because angular doesn't like buttons
	this.today = new Date(Date.now());
	this.tomorrow = new Date(Date.now() + 1000*60*60*24)
	this.dateSlots = [this.today.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'}), this.tomorrow.toLocaleDateString('en-US', {weekday: 'long', month: 'long', day: 'numeric'})];
	this.selectDate = function(dateChoice){
		this.dateSelect = this.dateSlots[dateChoice];
		this.dateIndex = dateChoice;
	};

	//helpers for date selection for dob
	//checks for leap years and days in a month
	this.years = range(1900, this.today.getFullYear()-14, 0);
	this.monthDayPairs = {
		0 : range(1, 31, 1),
		1 : range(1, 28, 1),
		2 : range(1, 31, 1),
		3 : range(1, 30, 1), 
		4 : range(1, 31, 1),
		5 : range(1, 30, 1),
		6 : range(1, 31, 1),
		7 : range(1, 31, 1),
		8 : range(1, 30, 1),
		9 : range(1, 31, 1),
		10 : range(1, 30, 1),
		11 : range(1, 31, 1)		
	}

	this.updateDates = function(){
		myYear = $("#dobyear").val();
		myMonth = $("#dobmonth").val();
		myCurrentDate = $("#dobdate").val();
		myDates = range(1, 31, 1);

		if(myYear != '?' && myMonth != '?'){
			myDates = this.monthDayPairs[myMonth];
			if(myYear % 4 === 0 && myMonth == 2){
				myDates = range(1, 29, 1);
			}
		}
		$("#dobdate").empty();
		$("#dobdate").append("<option></option>");

		for(var i = 1; i <= myDates.length; i++){
			$("#dobdate").append("<option value = " + String(i) + ">" + String(i) + "</option>");
		}
		if(myDates.indexOf(Number(myCurrentDate)) >= 0){
			$("#dobdate").val(myCurrentDate);
		}

	}

	//binds button click for time select to model because angular doesn't like buttons
	this.selectTime = function(timeChoice){this.timeSelect = timeChoice;};



	//binds button click for premade bags to model because angular doesn't like buttons
	this.selectBag = function(bagChoice){this.bag = bagChoice;};

/*	this.allergies = false;
	this.clearAllergies = function(){$('#allergybox').val(''); this.allergies = false;};*/


	//prints the page
	//can be a callback of a button
	this.print = function(){
		window.print();
	}

	//creates an appointment
	//with all of the information that the user provided
	this.sendReservation = function(user, rdate, rtime, rbag){
		if(user.firstName && user.lastName && user.dob && user.dob.year && user.dob.month && user.dob.day && rdate && rtime && rbag){
			fixedDates = [this.today, this.tomorrow];
			rdateFixed = fixedDates[this.dateIndex].getTime();
			console.log(rdateFixed)
			console.log(Date(rdateFixed))
			if(rbag == 'yes'){
				rbagFixed = true;
			}
			else{
				rbagFixed = false;
			}
			$http.post('/appointments/', {
				firstName: user.firstName,
				lastName: user.lastName,
				birthday: user.dob,
				date: rdateFixed,
				timeslot: rtime[0],
				premade: rbagFixed
			}).success(function(data, status, headers, config){
				$scope.submitSuccess = true;
			})
		}
		else{
			console.log("uhoh")
		}
	}

}); //end of controller 

}()); //end of wrapper, run the wrapper