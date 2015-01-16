//using angular 
	(function(){var app = angular.module('admin', []); //create a new app with a name and list of dependencies
	//make a new controller
	app.controller('AdminController', function() {
		/***********/
		/*  LOGIN  */
		/***********/
		this.loginError = false;
		this.login = function() {
			var valid = true; //TODO actually validate login information
			if (valid) {
				this.toSelectAction();
			} else {
				this.loginError = true;
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
			if (this.currentSection > 1) {
				this.toSelectAction(); //return to the select action screen
			} else {
				this.currentSection = 0;
			}
			//if the user goes back, the editing and adding buttons disappear and their fields should be cleared
			this.showEditDefaultHours = false;
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
			return ["4:30PM", "5:30PM"];
		}
		this.tomorrowTimes = function() {
			return ["9:00AM", "10:00AM", "11:00AM", "4:30PM", "5:30PM"];
		}

		//return list of guests, each of which has a name and a boolean representing premade bag or not
		//will need to query the database, and filter
		this.getGuests = function(day, time) {
			//FAKE DATA AHHH 
			if (time === "9:00AM") {
				return [{name: "hanna", premade_bag: false}, {name: "tricia", premade_bag: true}, {name: "shi-ke", premade_bag: false}];
			} else if (time === "10:00AM") {
				return [{name: "person 1", premade_bag: false}, {name: "person 2", premade_bag: true}];
			} else if (time === "4:30PM") {
				return [{name: "abc", premade_bag: true}, {name: "def", premade_bag: false}];
			} else {
				return [{name: 'persona', premade_bag: false}, {name: 'hello', premade_bag: false}];
			}
		};

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
			var times = [];
			if (day === 'today') {
				times = this.showTodayTimes;
			} else if (day === 'tomorrow') {
				times = this.showTomorrowTimes;
			} else {
				//ERROR should never get here
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

		//helper function, takes true/false and turns it into yes/no
		this.displayYesNo = function(trueOrFalse) {
			if (trueOrFalse) {
				return 'yes';
			} else {
				return 'no';
			}
		}

		//hides everything, to be called when the back button is pressed
		this.resetShowTimesAndGuests = function() {
			this.showToday = false;
			this.showTomorrow = false;
			this.showTodayTimes = makeTimeObjects(this.todayTimes());
			this.showTomorrowTimes = makeTimeObjects(this.tomorrowTimes());
		}

		/******************/
		/*  SPECIAL HOURS */
		/******************/
		//default times TODO: change this to reflect the actual times, from the backend

		//      FAAAAAAAAKE DATAAAAAAAAAAA
		this.mondayDefault = function() {return ['4:30 PM', '5:30 PM'];};
		this.tuesdayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		this.wednesdayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		this.thursdayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		this.fridayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		this.saturdayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};
		this.sundayDefault = function() {return ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];};

		this.defaultHours = function() {
			return [{"day":"Monday", "hours": this.mondayDefault()}, 
												{"day":"Tuesday", "hours": this.tuesdayDefault()}, 
												{"day":"Wednesday", "hours": this.wednesdayDefault()}, 
												{"day":"Thursday", "hours": this.thursdayDefault()},
												{"day":"Friday", "hours": this.fridayDefault()},
												{"day":"Saturday", "hours": this.saturdayDefault()},
												{"day":"Sunday", "hours": this.sundayDefault()}];
		};

		this.daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		//for editing default hours
		this.showEditDefaultHours = false;
		this.editDay = ''; //will reflect which day they are editing
		
		this.editDefaultHours = function(day) {
			this.showEditDefaultHours = true;
			this.editDay = day;
		};

		this.saveNewDefaultHours = function() {
			var day = this.editDay;

			//current editDay should be the correct day, selected when the user pressed an edit button
			//need to go through the text in the input fields in class='slots' and save their info to database, then clear their text
			//TODO: some parsing stuff, and accounting for user error

			//...
		};

		this.cancelNewDefaultHours = function() {
			//TODO clear whatever has been saved from the timeslots
			//hide the edit Default Hours
			this.showEditDefaultHours = false;
			this.editDay = '';
			//TODO: remove the additional timeslots also
		}

		/**********************************************/
		//TODO: implement a sort of update function that's called everytime the text changes, and saves temporary information
			//if user presses save, then format and write to database
			//if user presses cancel, then clear the temporary information
		/*********************************************/

		this.additionalDefaultTimeslot = function() {
			//adds new start and end time text input boxes
			$('.slots').append($("<input type='text' placeholder='9:00AM'>").addClass('new-start-time'));
			$('.slots').append($("<input type='text' placeholder='10:00AM'>").addClass('new-end-time'));
			$('.slots').append($("<input type='text' placeholder='27'>").addClass('new-max-cap'));
			$('.slots').append($("<button ng-click='ctrl.removeDefaultTimeslot()'>Remove</button>").addClass('remove-time-slot'));
			$('.slots').append($("<br>"));
			// var div  = $('.slot');
			// $('.slots').append(div);
		};

		this.removeDefaultTimeslot = function() {
			//figure out how to associate the remove button with the timeslots it's related to
		};

		/******************/
		/*  SPECIAL HOURS */
		/******************/
		this.specialRules = function(){ 
			//should return a list of rule objects, drawing from the database
			//each rule has rule.date and rule.times, where times is a list of times on that day
			return [
			{date: '2/14/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
			{date: '12/25/15', times: ['9:00AM', '10:00AM', '12:00PM', '3:00PM']},
			{date: '3/16/15', times: ['10:00AM', '11:00AM', '4:30PM']},
			{date: '5/23/15', times: ['4:30PM', '5:30', '6:30', '7:30']},
			{date: '2/2/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
			{date: '8/19/15', times: ['9:00AM', '3:30', '4:30PM', '5:00PM']},
			{date: '9/24/15', times: ['11:00AM', '12:00PM', '1:00PM', '2:00PM', '3:30PM', '4:30PM']},
			{date: '10/24/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM', '5:30']}
			];
		};

		this.today = new Date();
		this.tomorrow = new Date();
		this.tomorrow.setDate(this.tomorrow.getDate() + 1);
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
		}
		this.years = range(2015, 2200, 1);
	 	this.monthDayPairs = {
			'January' : range(1, 31, 1),
			'February' : range(1, 28, 1),
			'March' : range(1, 31, 1),
			'April' : range(1, 30, 1), 
			'May' : range(1, 31, 1),
			'June' : range(1, 30, 1),
			'July' : range(1, 31, 1),
			'August' : range(1, 31, 1),
			'September' : range(1, 30, 1),
			'October' : range(1, 31, 1),
			'November' : range(1, 30, 1),
			'December' : range(1, 31, 1)		
		};

		this.showEditSpecialHours = false;
		this.editDate = ''; //the date that is being edited, when user tries to edit special hours for date
		this.newDate = ''; //date that is being added, when user tries to add new date for special hours
		
		this.editSpecialHours = function(date) {
			//displays the edit special hours div, specific to the 'date' mentioned
			this.showEditSpecialHours = true;
			this.editDate = date;
		};

		this.removeSpecialTimeslot = function() {
			//removes a timeslot the user entered but does not want saved
		}

		this.saveNewEditedSpecialHours = function() {
			//depending on this.editDate
		}

		this.cancelNewEditedSpecialHours = function() {
			//TODO: clear whatever temporary information was saved
			this.showEditSpecialHours = false;
			this.editDate = '';
			//TODO: remove all additional timeslots
		}

		/***************/
		/*  ADMIN PAGE */
		/***************/
		//admin account stuff, returns list of admin accounts, retrieved from database
		this.fakeAdminData = function() { 
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
			//TODO: check that username isn't already taken
			if (pass !== passConfirm) {
				//have an error message show (use another boolean to control whether it's hidden or not)
			}
		};

		this.cancelNewAdminAccount = function() {
			this.showNewAdmin = false;
			//clear text fields
			$('#new-admin-username').val('');
			$('#new-admin-password').val('');
			$('#new-admin-confirm-password').val('');
		}


	}); //end of angular controller


}()); //end and run function
