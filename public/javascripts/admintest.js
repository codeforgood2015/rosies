//using angular 
	(function(){var app = angular.module('admin', []); //create a new app with a name and list of dependencies
	//make a new controller
	app.controller('AdminController', function($http, $scope) {

		var me = this;

		/***********/
		/*  LOGIN  */
		/***********/
		this.loginError = false;
		this.login = function() {
			var valid = true; //TODO actually validate login information
			if (valid) {
				this.toSelectAction();
			} else {
				this.loginError = true; //displays login error message, and prevents login button from progressing user to the next page
			}
		};

		/********************/
		/*  Changing Pages  */
		/********************/

			//section numbers -- 0:login, 1:actions, 2:viewguests, 3:hours, 4:accounts
		this.currentSection = 0;

		this.toSelectAction = function() {
			if (!this.loginError) this.currentSection = 1;
		};
		this.toSignupView = function() {
			if (!this.loginError) this.currentSection = 2;
		};
		this.toHoursView = function() {
			if (!this.loginError) this.currentSection = 3;
		};
		this.toAccountsView = function() {
			if (!this.loginError) this.currentSection = 4;
		};
		//back button
		this.back = function() {
			//hide the guests in viewgusts
			this.resetShowTimesAndGuests();
			//this.clearDefaultTimeslotsInput();
			//this.clearEditedSpecialTimeslots();
			if (this.currentSection > 1) {
				this.toSelectAction(); //return to the select action screen
			} else {
				this.currentSection = 0;
			}
			//if the user goes back, the editing and adding buttons disappear and their fields should be cleared
			//this.showEditDefaultHours = false;
			this.showNewAdmin = false;
			$("input :not(type=text)").val('');
			//TODO: remove the additional slots that have been created

		};



		/*************************/
		/*  VIEW CURRENT SIGNUPS */
		/*************************/

		this.showToday = false;
		this.showTomorrow = false;

		this.toggleToday = function() {
			this.showToday = !this.showToday;
			//hide all guests in today section
			this.showTodayTimes = makeTimeObjects(this.todayTimes());
		}
		this.toggleTomorrow = function() {
			this.showTomorrow = !this.showTomorrow;
			//hide all guests in tomorrow section
			this.showTomorrowTimes = makeTimeObjects(this.tomorrowTimes());
		}

		//FAKE DATA ... the below two functions should actually figure out the times for today and tomorrow
		this.todayTimes = function() {
			return ["9:00 AM", "10:00 AM", "11:00 AM", "4:30 PM", "5:30 PM"];
		}
		this.tomorrowTimes = function() {
			return ["9:00 AM", "10:00 AM", "11:00 AM", "4:30 PM", "5:30 PM"];
		}

		this.toMilitary = {
			'9:00 AM': '9:00',
			'10:00 AM': '10:00',
			'11:00 AM': '11:00',
			'12:00 PM': '12:00',
			'4:30 PM': '16:30',
			'5:30 PM': '17:30',
		}

		this.toNextMilitary = {
			'9:00 AM': '10:00',
			'10:00 AM': '11:00',
			'11:00 AM': '12:00',
			'12:00 PM': '13:00',
			'4:30 PM': '17:30',
			'5:30 PM': '18:30',
		}


		//converts string of form 'h:mm AM|PM' to 'h:mm' military time; e.g. "5:30 PM" -> "17:30"
		this.convertToMilitary = function(time) {
			//get hours and minutes with regex
			var hours = Number(time.match(/^(\d+)/)[1]);
			var minutes = Number(time.match(/:(\d+)/)[1]);
			var ampm = time.match(/\s(.*)$/)[1];
			//convert hours to 0 if it's 12 AM, and convert any afternoon times by adding 12
			if (ampm === 'AM' && hours === 12) {hours -= 12};
			if (ampm === 'PM' && hours < 12) {hours += 12};
			var sHours = hours.toString();
			var sMinutes = minutes.toString();
			var military = sHours + ":" + sMinutes;
			return military;
		}

		$scope.todayGuests = {};
		$scope.tomorrowGuests = {};

		for(var i = 0; i < this.todayTimes().length; i++){
			$scope.todayGuests[this.convertToMilitary(this.todayTimes()[i])] = [];
		}

		for(var i = 0; i < this.tomorrowTimes().length; i++){
			$scope.tomorrowGuests[this.convertToMilitary(this.tomorrowTimes()[i])] = [];
		}

		this.getTodayGuestsCallback = function(guests) {
			for(var i = 0; i <guests.length; i++){
				$scope.todayGuests[guests[i].timeslot[0]].push(guests[i]);
			}
		}			
		this.getTomorrowGuestsCallback = function(guests) {
			for(var i = 0; i <guests.length; i++){
				$scope.tomorrowGuests[guests[i].timeslot[0]].push(guests[i]);
			}			
		}

		//getTodayGuests and getTomorrowGuesets populate the this.todayGuests and this.tomorrowGuests lists by querying the database
		//when sending data,
			//date: the date to send, represented as a dateobject.getTime(), so will be represented as some number of milliseconds 
			//startTime: string representation of starting time of the timeslot, in military time form, e.g. '17:00'
		this.getTodayGuests = function(_time, callback) {
			var today = new Date();
			//version with startTime
		  // var year = today.getFullYear();
		  // var month = today.getMonth();
		  // var day = today.getDate();

		  // var sendDate = new Date(year, month, day, 0, 0, 0, 0).getTime();
		  // var time = this.convertToMilitary(_time);
		  // $http.put('/appointments/time', {date: sendDate, startTime: time}).success(function(data, status, headers, config) {
		  // 	$scope.todayGuests[me.convertToMilitary(_time)] = [];
		  // 	callback(data);
		  // }).error(function(data, status, headers, config) {
		  // 	console.log(data);
		  // 	callback([{name: 'error', premade: 'false'}]);
		  // });

		 // the old version, with timeslot instead of startTime
		  	var year = today.getFullYear();
		  	var month = today.getMonth();
		  	var day = today.getDate();

		  	var sendDate = new Date(year, month, day, 0, 0, 0, 0).getTime();
		  	var timeslot = [this.toMilitary[_time], this.toNextMilitary[_time]];
		  	$http.put('/appointments/time', {date: sendDate, timeslot: timeslot})
		  	.success(function(data, status, headers, config) {
		  		console.log(data)
		  		callback(data);
		  	}).error(function(data, status, headers, config) {
			  	console.log(data);
		  		callback([{name: 'error', premade: 'false'}]);
		  	});

		};

		this.getTomorrowGuests = function(_time, callback) {
			var tomorrow = new Date();
			// version that uses duration
		  // tomorrow.setDate(tomorrow.getDate() + 1);
		  // var year = tomorrow.getFullYear();
		  // var month = tomorrow.getMonth();
		  // var day = tomorrow.getDate();
		  // var sendDate = new Date(year, month, day, 0, 0, 0, 0).getTime();
		  // var time = this.convertToMilitary(_time);
		  // $http.put('/appointments/time', {date: sendDate, startTime: time}).success(function(data, status, headers, config) {
		  // 	$scope.tomorrowGuests[me.convertToMilitary(_time)] = [];
		  // 	callback(data);
		  // }).error(function(data, status, headers, config) {
		  // 	console.log(data);
		  // 	callback([{name: 'error', premade: 'false'}]);
		  // });

		 //version with timeslot instead of startTime
		  	tomorrow.setDate(tomorrow.getDate() + 1);
		  	var year = tomorrow.getFullYear();
		  	var month = tomorrow.getMonth();
		  	var day = tomorrow.getDate();
		  	var sendDate = new Date(year, month, day, 0, 0, 0, 0).getTime();
		  	var timeslot = [this.toMilitary[_time], this.toNextMilitary[_time]];
			$http.put('/appointments/time', {date: sendDate, timeslot: timeslot})
			.success(function(data, status, headers, config) {
		  		$scope.tomorrowGuests[me.toMilitary[_time]] = [];
		  		callback(data);
		  	}).error(function(data, status, headers, config) {
		  		console.log(data);
		  		callback([{name: 'error', premade: 'false'}]);
		  	});
		}

		//dumb utility function that is used to populate the showTodayTimes and showTomorrowTimes lists
		var makeTimeObjects = function(times) {
			var result = [];
			for (var i = 0; i<times.length; i++) {
				var obj = {time: times[i], show: false};
				result.push(obj);
			}
			return result
		}

		//these two should be populated with the appropriate time slots for today and tomorrow, along with whether or not to currently display them
		this.showTodayTimes = makeTimeObjects(this.todayTimes());
		this.showTomorrowTimes = makeTimeObjects(this.tomorrowTimes());

		this.showGuests = function(day, _time) {
			//determine whether or not the guests for day and time should be shown right now
			//update the data in todayGuests and tomorrowGuests
			var times = [];
			if (day === 'today') {
				times = this.showTodayTimes;
				this.getTodayGuests(_time, this.getTodayGuestsCallback);

			} else if (day === 'tomorrow') {
				times = this.showTomorrowTimes;
				this.getTomorrowGuests(_time, this.getTomorrowGuestsCallback);

			} else {
				console.log('should never get here');
			}	

			for (var j = 0; j < times.length; j++) {
				var t = times[j];
				if (t.time === _time) {
					return t.show;
				}
			}	
 		}

		//determines whether to hide or show the guests under the following time and day
		this.toggleGuests = function(day, _time) {
			var times = [];
			if (day === 'today') {
				times = this.showTodayTimes;
			} else if (day === 'tomorrow') {
				times = this.showTomorrowTimes;
			} else {
				//something is wrong, should always be either today or tomorrow
			}
			for (var j = 0; j < times.length; j++) {
				var t = times[j];
				if (t.time === _time) {
					var s = t.show;
					t.show = !s;
				}
			}
			return t.show;
		};

		//dumb helper function, takes true/false and turns it into yes/no
		this.displayYesNo = function(trueOrFalse) {
			if (trueOrFalse) {
				return 'yes';
			} else {
				return 'no';
			}
		}

		//hides everything in the viewguests tree, to be called when the back button is pressed
		this.resetShowTimesAndGuests = function() {
			this.showToday = false;
			this.showTomorrow = false;
			this.showTodayTimes = makeTimeObjects(this.todayTimes());
			this.showTomorrowTimes = makeTimeObjects(this.tomorrowTimes());
		}

		//hides or shows all reservations for a given day
		this.showAll = function(day){
			var hideOrShow = $('#show' + day).text();
			if(day == 'today'){
				if(hideOrShow == 'Show All'){
					me.showToday =  true;
					for(var i = 0; i < me.todayTimes().length; i++){
						me.showGuests("today", me.todayTimes()[i]);
					}
					$('#show' + day).text('Hide All');
				}
				else{
					me.showToday = false;
					$('#show' + day).text('Show All');

				}

			}
			else if (day == 'tomorrow'){
				if(hideOrShow == 'Show All'){
					me.showTomorrow = true;
					for(var i = 0; i < me.tomorrowTimes().length; i++){
						me.showGuests("tomorrow", me.tomorrowTimes()[i]);
					}
					$('#show' + day).text('Hide All');

				}
				else{
					me.showTomrrow = false;
					$('#show' + day).text('Show All');

				}
			}
		}

		//opens print dialogue, we need to also display a printer friendly version
		this.printPage = function(){
			window.print();
		}

		/******************/
		/*  DEFAULT HOURS */
		/******************/

		//FAKE DATA, replace soon plz 
		// this.mondayDefault = function() {return ['4:30 PM', '5:30 PM'];};
		// this.tuesdayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		// this.wednesdayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		// this.thursdayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		// this.fridayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		// this.saturdayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		// this.sundayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};



		//populates this.defaultHours list by querying database
		//should be called either with a refresh button or every time the page loads
		// this.getDefaultHours = function() {
		// 	//for each day of the week, get that day's default hours as a list of 
		// }

		// this.defaultHours = function() {
		// 	return [{"day":"Monday", "hours": this.mondayDefault()}, 
		// 										{"day":"Tuesday", "hours": this.tuesdayDefault()}, 
		// 										{"day":"Wednesday", "hours": this.wednesdayDefault()}, 
		// 										{"day":"Thursday", "hours": this.thursdayDefault()},
		// 										{"day":"Friday", "hours": this.fridayDefault()},
		// 										{"day":"Saturday", "hours": this.saturdayDefault()},
		// 										{"day":"Sunday", "hours": this.sundayDefault()}];
		// };

		// this.daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		
		// //for editing default hours
		// this.showEditDefaultHours = false; //true when the sidebar with the add timeslots form should appear
		
		// this.editDay = ''; //will reflect which day they are editing, so when they click submit, we know which day's data to change
		
		// this.newDefaultTimeslots = []; //array for us to save things to do when they add timeslots; will send to database when they click 'save'

		// this.editDefaultHours = function(day) {
		// 	this.clearDefaultTimeslotsInput(); //clear when the user changes days
		// 	this.showEditDefaultHours = true;
		// 	this.editDay = day;
		// };

		// this.clearDefaultTimeslotsInput = function() {
		// 	//to be called when a different edit button, or the cancel button, is pressed
		// 	$('#default-start-time').val('');
		// 	$('#default-end-time').val('');
		// 	$('#default-max-cap').val('');
		// 	this.newDefaultTimeslots = [];
		// };

		// this.addDefaultTimeslot = function() {
		// 	//jQuery to grab the info in the text boxes, add them to this.newDefaultTimeslots
		// 	var s = $('#default-start-time').val();
		// 	var e = $('#default-end-time').val();
		// 	var c = $('#default-max-cap').val();
		// 	var timeslot = {
		// 		start: s, end: e, cap: c
		// 	}
		// 	this.newDefaultTimeslots.push(timeslot);
		// };

		// this.removeDefaultTimeslot = function() {
		// 	//figure out how to associate the remove button with the timeslots it's related to
		// };

		// this.saveNewDefaultHours = function() {
		// 	var day = this.editDay;

		// 	//current editDay should be the correct day, selected when the user pressed an edit button
		// 	//need to go through the text in the input fields in class='slots' and save their info to database, then clear their text
		// 	//TODO: some parsing stuff, and accounting for user error

		// 	//...
		// 	this.clearDefaultTimeslotsInput();
		// };

		// this.cancelNewDefaultHours = function() {
		// 	this.clearDefaultTimeslotsInput(); //clear 
		// 	this.showEditDefaultHours = false;
		// 	this.editDay = '';
		// };
		// /******************/
		// /*  SPECIAL HOURS */
		// /******************/

		// this.specialRules = function(){ 
		// 	//should return a list of rule objects, drawing from the database
		// 	//each rule has rule.date and rule.times, where times is a list of times on that day
		// 	return [
		// 	{date: '2/14/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
		// 	{date: '12/25/15', times: ['9:00AM', '10:00AM', '12:00PM', '3:00PM']},
		// 	{date: '3/16/15', times: ['10:00AM', '11:00AM', '4:30PM']},
		// 	{date: '5/23/15', times: ['4:30PM', '5:30PM', '6:30PM', '7:30PM']},
		// 	{date: '2/2/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
		// 	{date: '8/19/15', times: ['9:00AM', '3:30PM', '4:30PM', '5:00PM']},
		// 	{date: '9/24/15', times: ['11:00AM', '12:00PM', '1:00PM', '2:00PM', '3:30PM', '4:30PM']},
		// 	{date: '10/24/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM', '5:30']}
		// 	];
		// };

		// /*EDIT SPECIAL HOURS FORM */
		// this.showEditSpecialHours = false;
		// this.editDate = ''; //the date that is being edited, when user tries to edit special hours for date
		
		// this.newEditedSpecialTimeslots = [];

		// this.clearEditedSpecialTimeslots = function() {
		// 	$('#special-start-time').val('');
		// 	$('#special-end-time').val('');
		// 	$('#special-max-cap').val('');
		// 	this.newEditedSpecialTimeslots = [];
		// }

		// this.addSpecialTimeslot = function() {
		// 	var s = $('#special-start-time').val();
		// 	var e = $('#special-end-time').val();
		// 	var c = $('#special-max-cap').val();

		// 	var timeslot = {
		// 		start: s, end: e, cap: c
		// 	};

		// 	this.newEditedSpecialTimeslots.push(timeslot);
		// };

		// this.editSpecialHours = function(date) {
		// 	//displays the edit special hours div, specific to the 'date' mentioned
		// 	this.showEditSpecialHours = true;
		// 	this.editDate = date;
		// 	this.clearEditedSpecialTimeslots();
		// };

		// this.removeSpecialTimeslot = function() {
		// 	//removes a timeslot the user entered but does not want saved
		// };

		// this.saveNewEditedSpecialHours = function() {
		// 	//depending on this.editDate
		// 	//clear 
		// 	this.clearEditedSpecialTimeslots();
		// };

		// this.cancelNewEditedSpecialHours = function() {
		// 	this.clearEditedSpecialTimeslots();
		// 	this.showEditSpecialHours = false;
		// 	this.editDate = '';
		// 	//TODO: remove all additional timeslots
		// }

		// //* ADD SPECIAL HOURS FORM */
		// this.today = new Date();
		// this.tomorrow = new Date();
		// this.tomorrow.setDate(this.tomorrow.getDate() + 1);
		// var range = function(start, end, up){
		// result = [];
		// if (up === 1){
		// 	for(var i = start; i <= end; i++){
		// 	result.push(i);
		// 	}
		// }
		// else{
		// 	for(var i = end; i >= start; i--){
		// 	result.push(i)
		// 	}
		// };
		// return result
		// }

		// this.years = range(2015, 2200, 1);
	 // 	this.monthDayPairs = {
		// 	'January' : range(1, 31, 1),
		// 	'February' : range(1, 28, 1),
		// 	'March' : range(1, 31, 1),
		// 	'April' : range(1, 30, 1), 
		// 	'May' : range(1, 31, 1),
		// 	'June' : range(1, 30, 1),
		// 	'July' : range(1, 31, 1),
		// 	'August' : range(1, 31, 1),
		// 	'September' : range(1, 30, 1),
		// 	'October' : range(1, 31, 1),
		// 	'November' : range(1, 30, 1),
		// 	'December' : range(1, 31, 1)		
		// };

		// this.monthToNumber = {
		// 	'January' :"1",
		// 	'February' : "2",
		// 	'March' : "3",
		// 	'April' : "4", 
		// 	'May' : "5",
		// 	'June' : "6",
		// 	'July' : "7",
		// 	'August' : "8",
		// 	'September' : "9",
		// 	'October' : "10",
		// 	'November' : "11",
		// 	'December' : "12"	
		// };

		// this.showDateError = false;

		// this.date = ''; //for parsing the input to the date selector
		// this.newDate = ''; //date that is being added, when user tries to add new date for special hours

		// this.clearDate = function() {
		// 	//clear the date values, and the showDateError back to false
		// 	$('#select-year').prop('selectedIndex', -1);
		// 	$('#select-month').prop('selectedIndex', -1);
		// 	$('#select-day').prop('selectedIndex', -1);
		// 	this.newDate = '';
		// 	this.date = '';
		// 	this.showDateError = false;
		// }

		// //debugging
		// this.debug = '';
		// this.debug1 = $('#select-date').val();
		// this.debug2 = $('#select-month').val();
		// this.debug3 = $('#select-year').val();


		// this.validateDate = function() {
		// 	this.addSpecialHours(); //for testing display; should not be here
		// 	this.debug = ''; //debugging this method...something with the selects is weird
		// 	var year = $('#select-year').val();
		// 	var month = $('#select-month').val();
		// 	var day = $('#select-day').val();
		// 	if (year === undefined) {
		// 		this.showDateError = true;
		// 		this.debug = '11';
		// 	} 
		// 	else if (month === undefined){
		// 		this.showDateError = true;
		// 		this.debug = '12';
		// 	} else if (month === undefined) {
		// 		this.showDateError = true;
		// 		this.debug = '13';
		// 	}

		// 	// else {
		// 	// 	validDays = this.monthDayPairs.month;
		// 	// 	if(year % 4 === 0 && month == 'February'){
		// 	// 		validDays = range(1, 29, 1);
		// 	// 	}
		// 	// 	if (day > validDays[validDays.length -1] | day < validDays[0]) {
		// 	// 		this.showDateError = true;
		// 	// 		this.debug = '2';
		// 	// 	} else {
		// 	// 		this.date = this.monthToNumber[month] + '/' + day.toString() + '/' + year.toString()[2] + year.toString()[3];
		// 	// 		this.addSpecialHours();
		// 	// 	}
		// 	// }
		// };

		// this.showAddSpecialHours = false;

		// this.newAddedSpecialTimeslots = [];

		// this.addSpecialHours = function() {
		// 	this.newDate = this.date;
		// 	this.showAddSpecialHours = true;
		// }

		// this.addAddedSpecialTimeslot = function() {
		// 	var s = $('#add-special-start-time').val();
		// 	var e = $('#add-special-end-time').val();
		// 	var c = $('#add-special-max-cap').val();
		// 	var timeslot = {
		// 		start: s, end: e, cap: c
		// 	};
		// 	this.newAddedSpecialTimeslots.push(timeslot);
		// }

		// this.clearNewAddedSpecialHours = function() {
		// 	this.newAddedSpecialTimeslots = [];
		// 	this.showAddSpecialHours = false;
		// 	this.clearDate();
		// }

		// this.saveNewAddedSpecialHours = function() {
		// 	//TODO: save hours
		// 	this.clearNewAddedSpecialHours();
		// }

		// this.cancelNewAddedSpecialHours = function() {
		// 	//cancel selection
		// 	this.showAddSpecialHours = false;
		// 	this.clearNewAddedSpecialHours();

		// }

		/***************/
		/*  ADMIN PAGE */
		/***************/
		//admin account stuff, returns list of admin accounts, retrieved from database
		this.getAdminUsernames = function() { 
			return ['admin', 'account1', 'account2', 'account3', 'scroll!!!!', 'account5', 'im bored', 'clearly',
			'hello world', 'hehehehehe', 'code for good', 'yayayayayay', 'rosies place', 'these are getting longer haha'];
		};

		this.removeAdmin = function(username) {
			//remove from database		
		};

		this.showNewAdmin = false; //change to true to display the new admin form

		this.toAddNewAdmin = function() {
			this.showNewAdmin= true;
		};

		this.addNewAdmin = function() {
			//read the text fields
			var username = $('.new-admin-username').value();
			var pass = $('.new-admin-password').value();
			var passConfirm = $('.new-admin-password').value();
			//TODO: post request to database
			// $.ajax('/', {type: "POST", data:{username: username, password:password, confirm:passConfirm}}
			// 	).done(function(data, textStatus, jqXHR) {
			// 		if (data.success) {
			// 			console.log('Successfully added new admin!');
			// 		} else {
			// 			if (data.err === "This username already exists") {

			// 			} else if (data.err === "Password doesn't match") {
			// 				this.showAdminErrorPassword = true;
			// 			}
			// 		}
			// }); 
			
		};

		this.cancelNewAdminAccount = function() {
			this.showNewAdmin = false;
			//clear text fields
			$('#new-admin-username').val('');
			$('#new-admin-password').val('');
			$('#new-admin-confirm-password').val('');
		}

		//TODO: need help with this
		this.checkValidUsername = function() {
			var check_user = $('#new-admin-username').val();
			// $.ajax({url:'/check-username', data:{username: check_user}}).done(function(data) {
			// 	return data.valid;
			// });
		}


		this.showAdminErrorUsername = function() {
				return !this.checkValidUsername();
		}

		this.showAdminErrorPassword = false;

	}); //end of angular controller


}()); //end and run function
