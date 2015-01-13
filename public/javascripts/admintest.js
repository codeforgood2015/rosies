//using angular 
	(function(){var app = angular.module('admin', []); //create a new app with a name and list of dependencies
	//make a new controller
	app.controller('AdminController', function($scope) {
		//to determine when to hide and show different divs
			//section numbers -- 0:login, 1:actions, 2:viewguests, 3:hours, 4:accounts
		$scope.currentSection = 0;
		//default times TODO: change it 
		this.defaultTimes = ['9:00AM', '10:00 AM', '11:00 AM', '4:30 PM', '5:30 PM'];
		//for editing default hours
		this.editHours = false;
		this.editDay = ''; //will reflect which day they are editing


		//increment based on buttons, use with ng-click in admintest.ejs
		this.nextSection = function() {
			$scope.currentSection += 1;
		};
		this.prevSection = function() {
			$scope.currentSection -= 1;
		}
		//to be continued

	});
	//animate the viewing of who is signed up for various dates and times
	//... to be continued

}());


//document ready
//$(document).ready(main);