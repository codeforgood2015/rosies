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
			//query database to get today's and tomorrow's signups
			this.initializeGuests();
			this.getTodayTimes();
			this.getTomorrowTimes();
			this.getTodayGuests();
			this.getTomorrowGuests();
		};
		this.toHoursView = function() {
			if (!this.loginError) this.currentSection = 3;
		};
		this.toAccountsView = function() {
			if (!this.loginError) this.currentSection = 4;
			this.getAdminUsernames();
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
			//hide the edit admin side
			this.hideNewAdminAccountView();
			$("input :not(type=text)").val('');
			//TODO: remove the additional slots that have been created
		};


		/*************************/
		/*  VIEW CURRENT SIGNUPS */
		/*************************/

		//helpful things to keep as variables 
		this.today = new Date();
		this.tomorrow = new Date();
		this.tomorrow.setDate(this.tomorrow.getDate() + 1);
		this.daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		//when true, sections under today or tomorrow are visible to user; when false, they are hidden
		this.showToday = false;
		this.showTomorrow = false;

		//holds rule objects returned from getTodayTimes and getTomorrowTimes
		this.todayTimes = [];
		this.tomorrowTimes = [];

		//dumb utility function that is used to populate the showTodayTimes and showTomorrowTimes lists with show:false
		//input is an array of rules, output is an array of objects each of the form - {time: rule.time and show: false}
		var makeTimeObjects = function(times) {
			var result = [];
			for (var i = 0; i<times.length; i++) {
				var obj = {time: times[i].time, show: false};
				result.push(obj);
			}
			return result
		}
		
		//array of objects {time: sometime, show: false} where 'sometime' is a timeslot gotten from rule.time, a timeslot is just an array of two strings, start and end
		this.showTomorrowTimes = makeTimeObjects(this.tomorrowTimes);

		//toggle whether or not the times nested underneath the 'today' tab are visible to user; toggled when user clicks the button
		this.toggleToday = function() {
			this.showToday = !this.showToday;
			//hide all guests in today section
			this.showTodayTimes = makeTimeObjects(this.todayTimes);
		}
		this.toggleTomorrow = function() {
			this.showTomorrow = !this.showTomorrow;
			//hide all guests in tomorrow section
			this.showTomorrowTimes = makeTimeObjects(this.tomorrowTimes);
		}

		//query database to populate this.todayTimes with the proper start times to display on the view guests page
		this.getTodayTimes = function() {
			//get date and create the date string to query database with
			var year = this.today.getFullYear().toString();
			var month = this.today.getMonth()+1; //getMonth returns integer 0-11
			var date = this.today.getDay();
			var monthString = month < 10 ? '0' + month.toString() : month.toString();
			var dateString = date < 10 ? '0' + date.toString() : date.toString();
			var findDate = year + "-" + monthString + "-" + dateString;
			//try to see if there's a special rule for today's date 
			$http.get('/rules/special/' + findDate).success(function(data, status, headers, config){
				if (data.content.length > 0) {
					me.todayTimes = data.content;
				} else {
					//if no special rule, fall back to default 
					me.queryDefaultToday();
				}
			}).error(function(data, status, headers, config) {
				window.alert('error with getTodayTimes()');
			});
		}

		//function to fall back on if query for special date rule returns an empty array
		//this queries for the day of week instead of specific date, thereby returning the default rules if no special ones exist
		this.queryDefaultToday = function() {
			var weekday = this.today.getDay(); //integer 0-6, 0 is Sunday, 6 is Saturday
			var sendDay = this.daysOfWeek[weekday];
			//get default hours for today
			$http.get('/rules/default/'+sendDay).success(function(data, status, headers, config) {
				me.todayTimes = data.content; 
			}).error(function(data, status, headers, config){
				window.alert('error with queryDefaultToday()');
			});
		}

		//analogous to getTodayTimes() above
		this.getTomorrowTimes = function() {
			//get date and create the date string to query database with
			var tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			var year = this.tomorrow.getFullYear().toString();
			var month = this.tomorrow.getMonth()+1; //getMonth returns integer 0-11
			var date = this.tomorrow.getDay();
			var monthString = month < 10 ? '0' + month.toString() : month.toString();
			var dateString = date < 10 ? '0' + date.toString() : date.toString();
			var findDate = year + "-" + month + "-" + date;
			//try to see if there's a special rule for today's date 
			$http.get('/rules/special/'+findDate).success(function(data, status, headers, config){
				if (data.content.length > 0) {
					me.tomorrowTimes = data.content;
					window.alert('get tomorrow times success');
				} else {
					//if no special rule, fall back to default 
					me.queryDefaultTomorrow();
				}
			}).error(function(data, status, headers, config) {
				window.alert('error with getTodayTimes()');
			});
		}

		//analogous to queryDefaultToday() above
		this.queryDefaultTomorrow = function() {
			var weekday = this.tomorrow.getDay();
			var sendDay = this.daysOfWeek[weekday];
			//get default hours for tomorrow 
			$http.get('/rules/default/'+sendDay).success(function(data, status, headers, config) {
				me.tomorowTimes = data.content;
			}).error(function(data, status, headers, config) {
				window.alert('error with queryDefaultTomorrow()');
			});
		}

		//converts string of form 'h:mm AM|PM' to 'hh:mm' military time; e.g. "5:30 PM" -> "17:30"
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
			if (minutes < 10) {
				sMinutes = "0" + sMinutes;
			}
			var military = sHours + ":" + sMinutes;
			return military;
		}

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
      } else if (Number(start[0]) == 12){
        start[2] = 'PM'
      } else{
        start[2] = 'AM';
      }
      
      if(Number(end[0]) > 12){
        end[0] = Number(end[0]) - 12;
        end[0] = String(end[0]);
        end[2] = 'PM';
      } else if (Number(end[0]) == 12){
        end[2] = 'PM';
      } else{
        end[2] = 'AM';
      }
      return(start[0] + ':' + start[1] + ' ' + start[2] + ' to ' + end[0] + ':' + end[1] + ' ' + end[2]);
	  };

		//arrays to store guest objects for each day
		//format is _time: [list of guests], where _time is a rule object returned from query, and each guest is an appointment object
		$scope.todayGuests = {};
		$scope.tomorrowGuests = {};

		//initialize todayGuests and tomorrowGuests to have the correct number of arrays to hold each time
		this.initializeGuests = function() {
			for(var i = 0; i < this.todayTimes.length; i++){
				$scope.todayGuests[this.todayTimes[i].time] = [];
			}
			//window.alert($scope.todayGuests[this.todayTimes[0].time]);
			for(var i = 0; i < this.tomorrowTimes.length; i++){
				$scope.tomorrowGuests[this.tomorrowTimes[i].time] = [];
			}
		}

		//callback functions used in getTodayGuests and getTomorrowGuests below
		//populate the arrays in todayGuests and tomorrowGuests with the guests returned from the database query
		this.getTodayGuestsCallback = function(guests) {
			for(var i = 0; i <guests.length; i++) {
				$scope.todayGuests[guests[i].timeslot].push(guests[i]); //match each guest to the time they belong in 
			}
		}			
		this.getTomorrowGuestsCallback = function(guests) {
			for(var i = 0; i <guests.length; i++){
				$scope.tomorrowGuests[guests[i].timeslot].push(guests[i]);
			}			
		}

		//getTodayGuests and getTomorrowGuesets populate the this.todayGuests and this.tomorrowGuests objects by querying the database
		//when sending data,
			//date: the date to send, represented as a dateobject.getTime(), so will be represented as some number of milliseconds 
			//startTime: string representation of starting time of the timeslot, in military time form, e.g. '17:00'
		//returns list of appointment objects that match that time
		this.getTodayGuests = function(_time, callback) { //_time is a rule object
			var today = new Date();
	  	var year = today.getFullYear();
	  	var month = today.getMonth();
	  	var day = today.getDate();

	  	var sendDate = new Date(year, month, day, 0, 0, 0, 0).getTime();
	  	var timeslot = [_time.time[0], _time.time[1]]; //[startTime, endTime] of the timeslot

	  	$http.put('/appointments/time', {date: sendDate, timeslot: timeslot})
	  	.success(function(data, status, headers, config) {
	  		$scope.todayGuests[_time.time] = []; //clear the array first
	  		callback(data.content); //populate array with most updated guest list
	  	}).error(function(data, status, headers, config) {
		  	window.alert('something wrong in getTodayGuests');
	  	});

		};
		this.getTomorrowGuests = function(_time, callback) { //_time is a rule object
			var tomorrow = new Date();
	  	tomorrow.setDate(tomorrow.getDate() + 1);
	  	var year = tomorrow.getFullYear();
	  	var month = tomorrow.getMonth();
	  	var day = tomorrow.getDate();
	  	
	  	var sendDate = new Date(year, month, day, 0, 0, 0, 0).getTime(); //in milliseconds because Date objects are annoying to pass to db
	  	var timeslot = [_time.time[0], _time.time[1]]; //[startTime, endTime]

			$http.put('/appointments/time', {date: sendDate, timeslot: timeslot})
			.success(function(data, status, headers, config) {
		  		$scope.tomorrowGuests[_time.time] = []; //clear array
		  		callback(data.content); //populate array with most updated guest list
		  	}).error(function(data, status, headers, config) {
		  		window.alert('something wrong in getTomorrowGuests');
		  	});
		}

		//determines whether to hide or show the guests under the following time and day
		this.toggleGuests = function(day, _time) {
			var times = [];
			if (day === 'today') {
				times = this.showTodayTimes;
			} else if (day === 'tomorrow') {
				times = this.showTomorrowTimes;
			} else {
				//should never get here	
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
			this.showTodayTimes = makeTimeObjects(this.todayTimes);
			this.showTomorrowTimes = makeTimeObjects(this.tomorrowTimes);
		}

		this.showGuests = function(day, _time) { //time is a rule object
			//determine whether or not the guests for day and time should be shown right now
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

		//hides or shows all reservations for a given day
		this.showAll = function(day){
			var hideOrShow = $('#show' + day).text();
			if(day == 'today'){
				if(hideOrShow == 'Show All'){
					me.showToday =  true;
					for(var i = 0; i < me.todayTimes.length; i++){
						me.showGuests("today", me.todayTimes[i]);
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
					for(var i = 0; i < me.tomorrowTimes.length; i++){
						me.showGuests("tomorrow", me.tomorrowTimes[i]);
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

		this.allUsernames = []; //to be displayed in the list, populated by getAdminUsernames()

		//populates this.allUsernames by querying database
		//should be called once when page loads, and whenever an admin account is successfully added or deleted, so that display represents most updated admin list
		this.getAdminUsernames = function() {
			//get request should return object 
			$http.get('/admin/usernames').success(function(data, status, headers, config) {
				me.allUsernames = data.content; //data.content is an array of all usernames in the database currently
			}).error(function(data, status, headers, config) {

			});
		};

		//handler connected to each 'remove' button, that will remove the admin account associated with adminID 
		this.removeAdmin = function(adminID) {
			//for some reason doing $http.delete didn't work, so doing it as a post
			$http.post('/admin/delete', {_id: adminID}).success(function(data, status, headers, config) {
				me.getAdminUsernames(); //refreshes the admin list to reflect this delete
			}).error(function(data, status ,headers, config) {
				//popup an error message or something? haven't decided
			});	
		};

		this.showNewAdmin = false; //change to true to display the new admin form

		//called on ng-click for the add admin button
		this.toAddNewAdmin = function() {
			this.showNewAdmin= true;
		};

		this.showAdminErrorUsername = false;
		this.showAdminErrorPassword = false;

		//called when user clicks 'save new admin account' button
		this.addNewAdmin = function() {
			//upon submitting, clear previous error messages
			this.showAdminErrorPassword = false;
			this.showAdminErrorUsername = false;
			
			//read the input text
			var newUsername = $('#new-admin-username').val();
			var newPass = $('#new-admin-password').val();
			var newPassConfirm = $('#new-admin-confirm-password').val();
			var newType = $('#new-admin-type').val();

			//confirm that they typed same password twice
			if(newPass !== newPassConfirm) {
				this.showAdminErrorPassword = true;
				return;
			}

			var newAdmin = {username: newUsername, password: newPass, type: newType};
			//post request to database
			$http.post('/admin', newAdmin).success(function(data, status, headers, config) {
				me.clearAdminTextFields();
				me.getAdminUsernames(); //refresh the admin list to reflect newly added account
			}).error(function(data, status, headers, config) {
				if (status === 403) {
					me.showAdminErrorUsername = true;
				} else {
					window.alert('something very wrong in addNewAdmin()'); //remove after debugging
				}
			});			
		};

		this.clearAdminTextFields = function() {
			$('#new-admin-username').val('');
			$('#new-admin-password').val('');
			$('#new-admin-confirm-password').val('');
			$('#new-admin-type').val('');
		}

		this.hideNewAdminAccountView = function() {
			this.clearAdminTextFields();
			this.showNewAdmin = false;
			this.showAdminErrorPassword = false;
			this.showAdminErrorUsername = false;			
		}

		// this.validUsername = true;

		// this.checkValidUsername = function() {
		// 	var check_user = $('#new-admin-username').val();
		// 	$http.post('/admin/check-username', {username: check_user}).success(function(data, status, headers, config) {
		// 		if (data.content.valid) {
		// 			this.validUsername = true;
		// 		} else {
		// 			this.validUsername = false;
		// 		}
		// 	}).error(function(data, status, headers, config) {

		// 	});
		// }

	}); //end of angular controller


}()); //end of closure, and run function
