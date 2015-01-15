//using angular 
	(function(){var app = angular.module('admin', []); //create a new app with a name and list of dependencies
	//make a new controller
	app.controller('AdminController', function() {

		/******************/
		/*  SPECIAL HOURS */
		/******************/
		//default times TODO: change this to reflect the actual times, from the backend
		this.mondayDefault = ['4:30 PM', '5:30 PM'];
		this.tuesdayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.wednesdayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.thursdayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.fridayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.saturdayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.sundayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];

		this.defaultHours = function() {
			return [{"day":"Monday", "hours": this.mondayDefault}, 
												{"day":"Tuesday", "hours": this.tuesdayDefault}, 
												{"day":"Wednesday", "hours": this.wednesdayDefault}, 
												{"day":"Thursday", "hours": this.thursdayDefault},
												{"day":"Friday", "hours": this.fridayDefault},
												{"day":"Saturday", "hours": this.saturdayDefault},
												{"day":"Sunday", "hours": this.sundayDefault}];
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
			{date: '2/14/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
			{date: '2/14/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
			{date: '2/14/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
			{date: '2/14/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
			{date: '2/14/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
			{date: '2/14/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']}
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

		/***********/
		/*  LOGIN  */
		/***********/
		this.login = function() {
			var valid = true; //TODO actually validate login information
			if (valid) {
				this.toSelectAction();
			} else {
				//error message
			}
		};

		/********************/
		/*  Changing Pages  */
		/********************/

			//section numbers -- 0:login, 1:actions, 2:viewguests, 3:hours, 4:accounts
		this.currentSection = 0;

		this.toSelectAction = function() {
			this.currentSection = 1;
		};
		this.toSignupView = function() {
			this.currentSection = 2;
		};
		this.toHoursView = function() {
			this.currentSection = 3;
		};
		this.toAccountsView = function() {
			this.currentSection = 4;
		};
		//back button
		this.back = function() {
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


	});

	//animate the viewing of who is signed up for various dates and times
	//... to be continued

}());
