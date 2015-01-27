//using angular 
	(function(){var app = angular.module('admin', []); //create a new app with a name and list of dependencies
	//make a new controller
	app.controller('AdminController', function($http, $scope) {

		var me = this;

		/***********/
		/*  LOGIN  */
		/***********/
		this.loginError = false;
		this.missingLogin = false;
		this.showNavbar = false; //change to false if admin type is not volunteer
		this.volunteer = false; //turns true if admin type is volunteer

		this.checkLogged = function(){
			$http.get('/admin/check').success(function(data, status, headers, config) {
				if(data.content.name){
					$scope.currentSection = 1;
					//check for admin or volunteer
					if (data.content.type === 'admin') {
						me.showNavbar = true;
					} else {
						me.volunteer = true;
					}
					//get all the times 
					me.initializeGuests();
					me.getTodayTimes(); 
					me.getTomorrowTimes();
				}
				else{
					$scope.currentSection = 0;
				}
			});
		}

		this.checkLogged();
		//called when user presses 'login' button
		this.login = function() {
			this.loginError = false; //reset every time user attempts to log in
			this.missingLogin = false;
			var u = $('#login-username').val();
			var p = $('#login-password').val();

			//if either is missing
			if (!u || !p) {
				this.missingLogin = true;
				return;
			} 
			//if both username and password filled out, send put request
			$http.put('/admin', {username: u, password: p}).success(function(data, status, headers, config) {
				//proceed to menu
				me.checkLogged();
				//clear text boxes
				$('#login-username').val('');
				$('#login-password').val('');
			}).error(function(data, status, headers, config) {
				me.loginError = true;
				return;
			}); 
		};

		//called if enter button is pressed and the cursor is in the password text input box
		this.enterLogin = function(event) {
			if (event.keyCode === 13) {
				this.login();
			}
		}

		this.logout = function(){
			$http.put('/admin/logout').success(function(data, status, headers, config){
				$scope.currentSection = 0;
				me.showNavbar = false;
				//window.location = '/admin';
			})
		}

		//function that recompresses any editing windows or expanded trees on the pages
		this.resetPages = function() {
				//hide the guests in viewgusts
				me.resetShowTimesAndGuests();
				//hide new admin form
				me.hideNewAdminAccountView();
				//hide editing and adding forms
				me.cancelEditedDefaultRule();
				me.cancelEditedSpecialRule();
				me.cancelAddedSpecialRule();
				me.cancelAddedDefaultRule();
				//clear inputs that aren't of type text
				$("input :not(type=text)").val('');
		}

		/********************/
		/*  Changing Pages  */
		/********************/

		//section numbers -- 0:login, 1:menu, 2:viewguests, 3:hours, 4:accounts, 5: addguest

		this.toSelectAction = function() {
			if (!this.loginError && !this.volunteer) $scope.currentSection = 1;
		};
		this.toSignupView = function() {
			if (!this.loginError) $scope.currentSection = 1;
			//query database to get today's and tomorrow's signups
			this.initializeGuests();
			this.getTodayTimes();
			this.getTomorrowTimes();
		};
		this.toHoursView = function() {
			if (!this.loginError) $scope.currentSection = 3;
			//get the current hours loaded
			this.getDefaultHours(0);
			this.getSpecialHours();
		};
		this.toAccountsView = function() {
			if (!this.loginError) $scope.currentSection = 4;
			this.getAdminUsernames();
		};
		this.toAddGuestsView = function() {
			if (!this.loginError) $scope.currentSection = 5;
		}
		//back button
		this.back = function() {
			if ($scope.currentSection > 1) {
				this.toSelectAction(); //return to the select action screen
			} else {
				$scope.currentSection = 0;
			}
			//hide the guests in viewgusts
			this.resetShowTimesAndGuests();
			//hide new admin form
			this.hideNewAdminAccountView();
			//hide editing and adding forms
			this.cancelEditedDefaultRule();
			this.cancelEditedSpecialRule();
			this.cancelAddedSpecialRule();
			this.cancelAddedDefaultRule();
			//clear inputs that aren't of type text
			$("input :not(type=text)").val('');
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
		
		//array of objects {time: sometime, show: false} where 'sometime' is a timeslot gotten from rule.time, a timeslot is just an array of two strings, start and end
		this.showTodayTimes = makeTimeObjects(this.todayTimes);
		this.showTomorrowTimes = makeTimeObjects(this.tomorrowTimes);

		//toggle whether or not the times nested underneath the 'today' tab are visible to user; toggled when user clicks the button
		this.toggleToday = function() {
			if(this.showToday){
				$('#showtoday').text('Show All');
			}
			else{
				$('#showtoday').text('Hide All');
			}
			this.showToday = !this.showToday;
			//hide all guests in today section
			this.showTodayTimes = makeTimeObjects(this.todayTimes);
		}
		this.toggleTomorrow = function() {
			if(this.showTomorrow){
				$('#showtomorrow').text('Show All');
			}
			else{
				$('#showtomorrow').text('Hide All');
			}
			this.showTomorrow = !this.showTomorrow;
			//hide all guests in tomorrow section
			this.showTomorrowTimes = makeTimeObjects(this.tomorrowTimes);
		}

		//query database to populate this.todayTimes with the proper start times to display on the view guests page
		this.getTodayTimes = function() {
			//get date and create the date string to query database with
			var year = this.today.getFullYear().toString();
			var month = this.today.getMonth()+1; //getMonth returns integer 0-11
			var date = this.today.getDate();
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
			var date = this.tomorrow.getDate();
			var monthString = month < 10 ? '0' + month.toString() : month.toString();
			var dateString = date < 10 ? '0' + date.toString() : date.toString();
			var findDate = year + "-" + monthString + "-" + dateString;
			//try to see if there's a special rule for today's date 
			$http.get('/rules/special/'+findDate).success(function(data, status, headers, config){
				if (data.content.length > 0) {
					me.tomorrowTimes = data.content;
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
				me.tomorrowTimes = data.content;
			}).error(function(data, status, headers, config) {
				window.alert('error with queryDefaultTomorrow()');
			});
		}

		//converts string of form 'h:mm AM|PM' to 'hh:mm' military time; e.g. "5:30 PM" -> "17:30"
		//taken from StackOverflow post http://stackoverflow.com/questions/15083548/convert-12-hour-hhmm-am-pm-to-24-hour-hhmm
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
			if (hours < 10) {
				sHours = "0" + sHours;
			}
			if (minutes < 10) {
				sMinutes = "0" + sMinutes;
			}
			var military = sHours + ":" + sMinutes;
			return military;
		}

		this.convertToStandard = function(military) {
			var t = military.split(':');
			var hour = t[0];
			var minute = t[1];
			var AMPM = '';
			if (Number.parse(hour) > 12) {
				AMPM = 'PM';
				hour = Number.parse(hour) - 12;
				hour = hour.toString();
			} else if (Number.parse(hour) == 12) {
				AMPM = 'PM'
			} else {
				AMPM = 'AM';
			}
			return hour + ':' + minute + ' ' + AMPM;
		}

		this.convertDateToReadable = function(date) {
			var d = date.split('-'); //assumes dates come in form yyyy-mm-dd, as we inputed them
			var year = d[0];
			var month = d[1];
			var date = d[2];
			return month + '/' + date + '/' + year;
		}

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
	  	var timeslot = _time.time; //[startTime, endTime] of the timeslot

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
		this.toggleGuests = function(day, _time) { //_time is a rule object
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
			//return t.show;
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
				me.getTodayGuests(_time, me.getTodayGuestsCallback);

			} else if (day === 'tomorrow') {
				times = this.showTomorrowTimes;
				me.getTomorrowGuests(_time, me.getTomorrowGuestsCallback);

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
					me.showTomorrow = false;
					$('#show' + day).text('Show All');

				}
			}
		}

		//opens print dialogue, we need to also display a printer friendly version
		this.print = function(){
			window.print();
		}

		/**********************/
		/*  ADD DEFAULT RULES */
		/**********************/

		/*HELPER ARRAYS FOR TIMESLOT SELECTION*/
		this.hoursRange = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
		this.minutesRange = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
		this.ampmSelect = ['AM', 'PM'];

		this.defaultHours = {}; //contains key-value pairs like "Monday":[rules], "Tuesday":[rules] etc
		this.showAddDefault = false; //show edit screen to add new timeslot
		this.addDay = ''; //day that we are adding a rule to
		this.addDefaultHoursError = false;

		this.convertFromMilitary = function(time) {
			//takes in a string of military time and converts to standard time, e.g. "9:00 AM" --> NOTE THE SPACE BEFORE 'AM'
		}	

		//utility function called in getDefaultHours to populate the defaultHours object
		this.populateDefaultHours = function(_day, _rules) { //day is "Monday", hours is list of rules
			this.defaultHours[_day] = _rules;
		}

		this.getDefaultHours = function(depth) {
			//stop once we've done all 7 days
			if (depth >= this.daysOfWeek.length) return;
			//day = 'Monday' or 'Tuesday' etc
			var day = this.daysOfWeek[depth];
			depth += 1; //increment depth so next loop we grab the next day in the list
			//for each day of the week, get the rules fo that day and populate the defaultHours object
			$http.get('/rules/default/'+day).success(function(data, status, headers, config) {
				data.content.sort(function(a, b){
					var atemp = a.time[0].split(':');
					var btemp = b.time[0].split(':');
					return Number(atemp[0]) - Number(btemp[0])
				});
				me.populateDefaultHours(day, data.content);
				me.getDefaultHours(depth); //recursive step
			}).error(function(data, status, headers, config) {
				window.alert('something wrong with getDefaultHours' + '\n' + status + '\n' + data.content);
			});
		}

		//when user clicks 'add' button next to each day, this function is called, should display the inputs to add new default timeslot
		this.addDefaultHours = function(day) { //takes in a string like "Monday"
			this.showAddDefault = true;
			this.addDay = day;
			//if we're showing the adding window, we don't know the edit window
			this.cancelEditedDefaultRule();
		}

		this.saveAddedDefaultRule = function() {
			//check that all values exist and that capacities are both positive integers
			if (!$scope.adsh || !$scope.adsm || !$scope.adsa || !$scope.adeh || !$scope.adem || !$scope.adea || $scope.admc < 0 || $scope.adw < 0) {
				this.addDefaultHoursError = true;
				return;
			} else if (!$scope.admc || !$scope.adw) {
				this.addDefaultHoursError = true;
				return;
			} else if (!this.validateCapacity($scope.admc) || !(this.validateCapacity($scope.adw))) {
				this.addDefaultHoursError = true;
				return;				
			}

			var s = this.convertToMilitary($scope.adsh + ':' + $scope.adsm + ' ' + $scope.adsa);
			var e = this.convertToMilitary($scope.adeh + ':' + $scope.adem + ' ' + $scope.adea);
			//check that start time is earlier than end time
			if (!this.validateTime(s, e)) {
				this.addDefaultHoursError = true;
				return;
			}

			var c = $scope.admc;
			var w = $scope.adw; 
			var r = false; //repeat
			var d = this.addDay; //"Monday" or the like
			var data = {
				maxCap: c, 
				maxWaitlist: w,
				time: [s,e],
				date: d,
				repeat: r
			};
			//use post to /rules/special to add a new rule
			$http.post('/rules/special', data).success(function(data, status, headers, config) {
				me.resetAddedDefault(); //clear text fields
				me.getDefaultHours(0); //reload the hours 
			}).error(function(data, status, headers, config) {
				window.alert('error in saveAddedDefaultHours');
			});
		} 

		this.cancelAddedDefaultRule = function() {
			this.showAddDefault = false;
			this.addDefaultHoursError = false;
			this.addDay = '';
			this.resetAddDefault();
		}

		this.resetAddedDefault = function() {
			$scope.adsh = undefined;
			$scope.adsm = undefined;
			$scope.adsa = undefined;
			$scope.adeh = undefined;
			$scope.adem = undefined;
			$scope.adea = undefined; 
			$scope.admc = undefined;
			$scope.adw = undefined;
		}

		/**********************/
		/* EDIT DEFAULT RULES */
		/**********************/

		this.showEditDefault = false; //show the edit screen AND the hour being edited and delete button
		this.editRule = {}; //rule that we are changing
		this.editDefaultHoursError = false;

		//called when edit button is clicked
		this.editDefaultHours = function(rule) { //takes in a rule object			
			this.showEditDefault = true;
			this.editRule = rule;
			//if we're showing the editing window, we don't also show the add window
			this.cancelAddedDefaultRule();
		}

		this.saveEditedDefaultRule = function() {
			this.editDefaultHoursError = false;
			//push new data to database using put request and refresh list of hours
			if (!$scope.edsh || !$scope.edsm || !$scope.edsa || !$scope.edeh || !$scope.edem || !$scope.edea || $scope.edmc < 0 || $scope.edw < 0) {
				this.editDefaultHoursError = true;
				return;
			} else if (!$scope.edmc || !$scope.edw) {
				this.editDefaultHoursError = true;
				return;
			} else if (!this.validateCapacity($scope.edmc) || !(this.validateCapacity($scope.edw))) {
				this.editDefaultHoursError = true;
				return;				
			}

			var s = this.convertToMilitary($scope.edsh + ':' + $scope.edsm + ' ' + $scope.edsa);
			var e = this.convertToMilitary($scope.edeh + ':' + $scope.edem + ' ' + $scope.edea);
			if (!this.validateTime(s, e)) {
				this.editDefaultHoursError = true;
				return;
			}

			var c = $scope.edmc;
			var w = $scope.edw;
			var id = this.editRule._id;
			var data = {
				time: [s, e],
				maxCap: c,
				maxWaitlist: w,
				repeat: false
			};
			//put request to modify the rule specified by id
			$http.put('/rules/'+id, data).success(function(data, status, headers, config) {
				me.editRule = data.content;
				me.resetEditDefault();
				me.getDefaultHours(0);
			}).error(function(data, status, headers, config) {
				window.alert('error in saveEditedDefaultHours\n' + status + '\n' + data.content);
			});
		}

		this.cancelEditedDefaultRule = function() {
			this.showEditDefault = false;
			this.editDefaultHoursError = false;
			this.editRule = {};
			this.resetEditDefault();
		}

		//clears the text fields in the edit default form
		this.resetEditDefault = function() {
			$scope.edsh = undefined;
			$scope.edsm = undefined;
			$scope.edsa = undefined;
			$scope.edeh = undefined;
			$scope.edem = undefined;
			$scope.edea = undefined; 
			$scope.edmc = undefined;
			$scope.edw = undefined;
		}

		this.deleteDefaultRule = function(rule) { //rule is a rule object
			var id = rule._id;
			$http.delete('/rules/'+id).success(function(data, status, headers, config) {
				me.getDefaultHours(0);
			}).error(function(data, status, headers, config) {
				window.alert('error in deleteRule');
			});
		}

		// /***********************/
		// /*  EDIT SPECIAL RULES */
		// /***********************/

		this.specialRules = {}; //key-value pairs like date:[rules]
		this.specialDates = []; //array to keep track of all dates that have special rules associated with them
		this.showEditSpecial = false;
		this.editSpecialHoursError = false;
		this.specialRule = {}; //rule that is selected for editing and/or deleting

		//utility to help populate all the special rules as key-value pairs
		this.populateSpecialRulesAndDates = function(rules) { //takes in array of all rules
			this.specialRules = {};
			this.specialDates = [];
			for (var i = 0; i < rules.length; i ++) {
				var rule = rules[i];
				var date = rule.date;
				//add to specialDates if necessary
				if (this.specialDates.indexOf(date) < 0) {
					this.specialDates.push(date);
				}
				//add to specialRules 
				if (!this.specialRules[date]) { //if already there, add this rule
					this.specialRules[date] = [];
				} 
				this.specialRules[date].push(rule);
			}
		}

		this.getSpecialHours = function() {
			$http.get('/rules/special').success(function(data, status, headers, config){
				me.populateSpecialRulesAndDates(data.content);
			}).error(function(data, status, headers, config) {
				window.alert('error in getSpecialHours');
			});
		}

		this.editSpecialHours = function(rule) {
			this.showEditSpecial = true;
			this.specialRule = rule; //rule to edit
		}

		this.saveEditedSpecialRule = function() {
			this.editSpecialHoursError = false;
			//checks
			if (!$scope.essh || !$scope.essm || !$scope.essa || !$scope.eseh || !$scope.esem || !$scope.esea || $scope.esmc < 0 || $scope.esw < 0) {
				this.editSpecialHoursError = true;
				return;
			} else if (!$scope.esmc || !$scope.esw) {
				this.editSpecialHoursError = true;
				return;
			} else if (!this.validateCapacity($scope.esmc) || !(this.validateCapacity($scope.esw))) {
				this.editSpecialHoursError = true;
				return;				
			}
			//grab things, send to database, reload
			var s = this.convertToMilitary($scope.essh + ':' + $scope.essm + ' ' + $scope.essa);
			var e = this.convertToMilitary($scope.eseh + ':' + $scope.esem + ' ' + $scope.esea);
			if (!this.validateTime(s, e)) {
				this.editSpecialtHoursError = true;
				return;
			}
			var c = $scope.esmc;
			var w = $scope.esw;
			var id = this.specialRule._id;
			var r = false; //repeat false
			var data = {
				time: [s, e],
				maxCap: c,
				maxWaitlist: w,
				repeat: r
			};
			$http.put('/rules/' + id, data).success(function(data, status, headers, config) {
				me.getSpecialHours();
			}).error(function(data, status, headers, config) {
				window.alert('error in saveEditedSpecialHours');
			});
		}

		this.cancelEditedSpecialRule = function() {
			this.showEditSpecial = false;
			this.editSpecialHoursError = false;
			this.specialRule = {};
			this.resetEditSpecial();
		}

		//clears all input text boxes for editing special hours
		this.resetEditSpecial = function() {
			$scope.essh = undefined;
			$scope.essm = undefined;
			$scope.essa = undefined;
			$scope.eseh = undefined;
			$scope.esem = undefined;
			$scope.esea = undefined; 
			$scope.esmc = undefined;
			$scope.esw = undefined;
		}


		this.deleteSpecialRule = function(rule) { //rule is a rule object
			var id = rule._id;
			$http.delete('/rules/'+id).success(function(data, status, headers, config) {
				me.getSpecialHours();
			}).error(function(data, status, headers, config) {
				window.alert('error in deleteRule');
			});
		}

		/*********************/
		/* ADD SPECIAL RULES */
		/*********************/
		this.showAddSpecial = false;
		this.addSpecialHoursError = false;
		this.showDateError = false; //if the date they entered is somehow invalid. 
		this.newDate = ''; //to store the current date that's being edited

		this.addSpecialRule = function() {
			this.showDateError = false; //reset to false
			this.validateDate();
			if (!this.showDateError) {
				this.showAddSpecial = true;
			}
		}

		this.saveAddedSpecialRule = function() {
			this.addSpecialHoursError = false;
			me.validateDate();
			if (!$scope.assh || !$scope.assm || !$scope.assa || !$scope.aseh || !$scope.asem || !$scope.asea || $scope.asmc < 0 || $scope.asw < 0) {
				this.addSpecialHoursError = true;
				return;
			} else if (!$scope.asmc || !$scope.asw) {
				this.addSpecialHoursError = true;
				return;
			} else if (!this.validateCapacity($scope.asmc) || !(this.validateCapacity($scope.asw))) {
				this.addSpecialHoursError = true;
				return;				
			}

			if (this.newDate.length > 0) {
			var s = this.convertToMilitary($scope.assh + ':' + $scope.assm + ' ' + $scope.assa);
			var e = this.convertToMilitary($scope.aseh + ':' + $scope.asem + ' ' + $scope.asea);
			if (!this.validateTime(s, e)) {
				this.addSpecialHoursError = true;
				return;
			}
			var c = $scope.asmc;
			var w = $scope.asw;
				var d = this.newDate;
				var r = false; //repeat false
				var data = {
					time: [s, e],
					maxCap: c,
					maxWaitlist: w,
					date: d,
					repeat: r
				};		
				$http.post('/rules/special', data).success(function(data, status, headers, config) {
					me.clearDate();
					me.getSpecialHours();
				}).error(function(data, status, headers, config) {
					window.alert('error in saveEditedSpecialHours');
				});
			}
		}

		//when user clicks cancel, clear date selection
		this.cancelAddedSpecialRule = function() {
			this.showAddSpecial = false;
			this.addSpecialHoursError = false;
			this.clearDate();
		}

		this.clearDate = function() {
			//clear the date values, and the showDateError back to false
			if (!this.showDateError) {
				$('#select-year').prop('selectedIndex', 0);
				$('#select-month').prop('selectedIndex', 0);
				$('#select-date').prop('selectedIndex', 0);
			}
			this.newDate = '';
			this.showDateError = false;
			this.resetAddedSpecial();
		}

		this.resetAddedSpecial = function() {
			$scope.assh = undefined;
			$scope.assm = undefined;
			$scope.assa = undefined;
			$scope.aseh = undefined;
			$scope.asem = undefined;
			$scope.asea = undefined; 
			$scope.asmc = undefined;
			$scope.asw = undefined;
		}

		//utility function that returns an array from start to end, incremented by 1 either up or down
		var range = function(start, end, up){
		result = [];
		if (up === 1){
			for(var i = start; i <= end; i++){
				result.push(i);
			}
		} else{
			for(var i = end; i >= start; i--){
				result.push(i)
			}
		};
		return result
		}

		//used to generate the options for the year select; always goes from now until 100 years from now
		this.futureYears = range(this.today.getFullYear(), this.today.getFullYear() + 100, 1);
		this.allDays = range(1, 31, 1);
		//utility mapping from month to number and to the list of days allowed in that month
		var monthToNumber = {
			'January' : ["01", range(1,31,1)],
			'February' : ["02", range(1, 28, 1)],
			'March' : ["03", range(1, 31, 1)],
			'April' : ["04",  range(1, 30, 1)],
			'May' : ["05", range(1, 31, 1)],
			'June' : ["06", range(1, 30, 1)],
			'July' : ["07", range(1, 31, 1)],
			'August' : ["08", range(1,31, 1)],
			'September' : ["09", range(1, 30, 1)],
			'October' : ["10", range(1, 31, 1)],
			'November' : ["11", range(1, 30, 1)],
			'December' : ["12", range(1, 31, 1)]	
		};

		//utility function to check that the date entered is valid 
		this.validateDate = function() {
			var year = $('#select-year').val();
			var month = $('#select-month').val();
			var day = $('#select-date').val();
			var last_allowed_date = monthToNumber[month][1][(monthToNumber[month][1].length)-1];
			if (month === 'February' && Number.parse(year)%4 == 0) {
				last_allowed_date = 29;
			}
			if (!year || !month || !day) {
				this.showDateError = true;
			} else if (day > last_allowed_date) {
				this.showDateError = true;
			} else {
				if (day < 10) {
					day = '0' + day;
				}
				this.newDate = year + '-' + monthToNumber[month][0] + '-' + day;
			}
			if (this.showDateError) {
				this.cancelAddedSpecialRule();
				this.showDateError = true; //because it gets reset in this.cancelAddedSpecialRule();
			}
		}

		//validates that the capacity input string represents a positive integer
		this.validateCapacity = function(cap) {
			//regex borrowed from http://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
			return /^\+?[1-9]\d*$/.test(cap);
		}

		//validates that start time is earlier than end time
		this.validateTime = function(start, end) { //start and end are both strings in military time format
			var arbitraryDate = '1971 01 01 '; //space intentionally left at the end of the string
			var startTime = Date.parse(arbitraryDate + start);
			var endTime = Date.parse(arbitraryDate + end);
			return (startTime < endTime);
		}

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

		/***************/
		/*  ADD GUESTS */
		/***************/

		this.attempted = false;
		this.createSuccess = false;

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

		this.create = function(user){
		if(user && user.firstName && user.lastName && user.dob && user.dob.year && user.dob.month && user.dob.day){
			$http.post('/guest/add', {
				firstName: user.firstName,
				lastName: user.lastName,
				birthday: user.dob
			}).success(function(data, status, headers, config){
				if(data.content == 'done'){
					me.createSuccess = true;	
				}
				else if (data.content == 'exists'){
					window.alert('this guest is already in the database');
				}
				else{
					window.alert('something went wrong. please contact cfgrp@mit.edu');
				}

			}).error(function(data, status, headers, config){
				console.log(status)
			});
		} else {
			this.attempted = true;
		}
		};

		this.resetCreate = function(){
			me.attempted = false;
			$scope.user = {};
			me.createSuccess = false;
		};

	}); //end of angular controller


}()); //end of closure, and run function
