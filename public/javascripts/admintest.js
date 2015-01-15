//using angular 
	(function(){var app = angular.module('admin', []); //create a new app with a name and list of dependencies
	//make a new controller
	app.controller('AdminController', function() {
		//to determine when to hide and show different divs
			//section numbers -- 0:login, 1:actions, 2:viewguests, 3:hours, 4:accounts
		this.currentSection = 0;
		//default times TODO: change this to reflect the actual times, from the backend
		this.mondayDefault = ['4:30 PM', '5:30 PM'];
		this.tuesdayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.wednesdayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.thursdayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.fridayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.saturdayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		this.sundayDefault = ['9:00 AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];

		this.defaultHours = [{"day":"Monday", "hours": this.mondayDefault}, 
												{"day":"Tuesday", "hours": this.tuesdayDefault}, 
												{"day":"Wednesday", "hours": this.wednesdayDefault}, 
												{"day":"Thursday", "hours": this.thursdayDefault},
												{"day":"Friday", "hours": this.fridayDefault},
												{"day":"Saturday", "hours": this.saturdayDefault},
												{"day":"Sunday", "hours": this.sundayDefault}];

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

		this.additionalTimeslot = function() {
			//adds new start and end time text input boxes
			// $('.slots').append($("<input type='text' placeholder='9:00AM'>").addClass('new-start-time'));
			// $('.slots').append($("<input type='text' placeholder='10:00AM'>").addClass('new-end-time'));
			// $('.slots').append($("<input type='text' placeholder='27'>").addClass('new-max-cap'));
			// $('.slots').append($("<button ng-click='ctrl.removeTimeslot()'>Remove</button>").addClass('remove-time-slot'));
			// $('.slots').append($("<br>"));
			var div  = $('.slot');
			$('.slots').append(div);
		};

		this.removeTimeslot = function() {
			//figure out how to associate the remove button with the timeslots it's related to
		};

		this.specialRules = function(){
			//should return a list of rule objects, drawing from the database
			//each rule has rule.date and rule.times, where times is a list of times on that day
			return [
			{date: '2/14/15', times: ['9:00AM', '10:00AM', '11:00AM', '4:30PM']},
			{date: '12/25/15' times: ['9:00AM', '10:00AM', '12:00PM', '3:00PM']}
			];
		}

		//admin account stuff, all fake right now
		this.fakeAdminData = function() { 
			return ['admin', 'account1', 'account2', 'account3', 'scroll!!!!', 'account5', 'im bored', 'clearly',
			'hello world', 'hehehehehe', 'code for good', 'yayayayayay', 'rosies place', 'these are getting longer haha'];
		}

		this.ShowNewAdmin = false; //change to true to display the new admin form

		this.toAddNewAdmin = function() {
			this.showNewAdmin= true;
		}

		this.addNewAdmin = function() {
			//read the text fields
			var username = $('.new-admin-username').value();
			var pass = $('.new-admin-password').value();
			var passConfirm = $('.new-admin-password').value();
			//TODO: check that username isn't already taken
			if (pass !== passConfirm) {
				//have an error message show (use another boolean to control whether it's hidden or not)
			}
		}


		//change pages based on buttons, use with ng-click in admintest.ejs
		this.toSelectAction = function() {
			this.currentSection = 1;
		};
		this.toSignupView = function() {
			this.currentSection = 2;
		}
		this.toHoursView = function() {
			this.currentSection = 3;
		}
		this.toAccountsView = function() {
			this.currentSection = 4;
		}
		this.back = function() {
			if (this.currentSection > 1) {
				this.toSelectAction(); //return to the select action screen
			} else {
				this.currentSection = 0;
			}
		}

	});

	//animate the viewing of who is signed up for various dates and times
	//... to be continued

}());
