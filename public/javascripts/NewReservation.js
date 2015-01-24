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
var app = angular.module('dateTime', ['pascalprecht.translate']);
app.config(function($translateProvider){

	//english
	$translateProvider.translations('en', {
		//header
		'LOGO_CAPTION' : 'Food Pantry Sign Up',
		'BACK' : 'back',

		//months
		'JANUARY' : 'January',
		'FEBRUARY' : 'February',
		'MARCH' : 'March',
		'APRIL' : 'April',
		'MAY' : 'May',
		'JUNE' : 'June',
		'JULY' : 'July',
		'AUGUST' : 'August',
		'SEPTEMBER' : 'September',
		'OCTOBER' : 'October',
		'NOVEMBER' : 'November',
		'DECEMBER' : 'December',

		//page 1
		'LOG_IN' : 'Log In',
		'FIRST_NAME' : 'First Name',
		'LAST_NAME' : 'Last Name',
		'DATE_OF_BIRTH' : 'Date of Birth',
		'CONTINUE' : 'continue',

		//page1 errors
		'MISSING_FIRST' : 'please provide your first name',
		'MISSING_LAST' : 'please provide your last name',
		'MISSING_DOB' : 'please provide your date of birth',

		//page2
		'SELECT_A_DATE' : 'Select a Date',
		'TODAY' : 'today',
		'TOMORROW' : 'tomorrow',

		//page3
		'SELECT_A_TIME' : 'Select a Time',

		//page4
		'PREMADE_BAG' : 'Premade Bag',
		'YES' : 'YES',
		'NO' : 'NO',
		'MAKE_BAG': 'make me a bag',
		'I_CHOOSE': 'I want to pick my own food',

		//page5
		'CONFIRMATION' : 'Confirmation',
		'NAME' : 'Name',
		'DATE' : 'Date', 
		'TIME' : 'Time',
		'SUBMIT' : 'submit',
		'SUCCESS' : 'Successfully Saved!',
		'PRINT' : 'print page',
		'EXIT' : 'exit'
	});

	//chinese
	$translateProvider.translations('zh', {
		//header
		'LOGO_CAPTION' : '登记',
		'BACK' : '返回',

		//months
		'JANUARY' : '一月',
		'FEBRUARY' : '二月',
		'MARCH' : '三月',
		'APRIL' : '四月',
		'MAY' : '五月',
		'JUNE' : '六月',
		'JULY' : '七月',
		'AUGUST' : '八月',
		'SEPTEMBER' : '九月',
		'OCTOBER' : '十月',
		'NOVEMBER' : '十一月',
		'DECEMBER' : '十二月',

		//page 1
		'LOG_IN': '登录',
		'FIRST_NAME' : '名',
		'LAST_NAME' : '姓氏',
		'DATE_OF_BIRTH' : '出生日期', 
		'CONTINUE' : '继续',

		//page1 errors
		'MISSING_FIRST' : '请输入你的名字',
		'MISSING_LAST' : '请输入你的姓氏',
		'MISSING_DOB' : '请输入你的出生日期',

		//page2
		'SELECT_A_DATE' : '选择一个日期',
		'TODAY' : '今天',
		'TOMORROW' : '明天',

		//page3
		'SELECT_A_TIME' : '选择一个时间',

		//page4
		'PREMADE_BAG' : '已经预备好的袋子',
		'YES' : '是',
		'NO' : '不是',
		'MAKE_BAG': '替我预备一个袋子',
		'I_CHOOSE': '我想自己选择食物',

		//page5
		'CONFIRMATION' : '确定',
		'NAME' : '名字',
		'DATE' : '日期', 
		'TIME' : '时间',
		'SUBMIT' : '确定',
		'SUCCESS' : '成功储存',
		'PRINT' : '列印',
		'EXIT' : '退出'
	});

	$translateProvider.preferredLanguage('en');
}); //end of translation
		
app.controller('datetimeController', function($scope, $translate, $http){
	var me = this;
	$scope.langKey = 'en'; //defaults to English
	$scope.currentSelect = -1;
	this.attempted = false;
	$scope.submitSuccess = false;
	$scope.timeSlots = [['9:00 am to 10:00 am', '10:00 am  to 11:00 am', '11:00 am to 12:00 noon', '4:30 pm to 5:30 pm', '5:30 pm to 6:30 pm'],['9:00 am to 10:00 am', '10:00 am  to 11:00 am', '11:00 am to 12:00 noon', '4:30 pm to 5:30 pm', '5:30 pm to 6:30 pm']];
	this.dateIndex = 0;
	this.timeSelect = ['9:00', '10:00'];
	this.lastVisit = {};
	this.lastVisit.date = '';
	this.lastVisit.timeSlot = '';


	$scope.timeSlots[0] = [];
	$scope.timeSlots[1] = [];

	//allows for different languages
	//langKey is a 2 letter abbreviation for language
	//this function is basically the same as the tutorial found here http://angular-translate.github.io/docs/#/guide/07_multi-language
	//'en' : English
	//'es' : Spanish
	//'zh' : Chinese
	//'pt' : Portuguese
	//'ht' : Haitian Creole
	//'kea' : Kabuverdianu (Cape Verdean Creole)
	$scope.changeLanguage = function(langKey){
		//toLocaleString is not supported for ht and kea. Need to do casework to add these in
		//TODO: ask Sandy to ask how date constructors work in creole.
		$scope.dateSlots = [me.today.toLocaleString(langKey, me.dateOptions), me.tomorrow.toLocaleString(langKey, me.dateOptions)];
		$scope.langKey = langKey;
		$translate.use(langKey);
	}

	//CLEARS ALL USER DATA AND SETS ALL BACK TO DEFAULTS
	//CALLED ON EXIT BUTTON AND ON HITTING BACK TO THE FRONT PAGE
	this.reset = function(){
		$scope.currentSelect = -1;
		$scope.user = {};
		me.dateSelect = '';
		me.timeSelect = '';
		me.bag = '';
		me.attempted = false;
		me.lastVisit = {};
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
			me.reset();
		}
	};

	//GUEST LOGIN FUNCTION
	//VALIDATES THAT ALL OF THE ENTRIES ARE FILLED
	//IF THEY ARE, CHECK DATABASE FOR THE USER
	//IF THE USER IS VALID, GET THE LATEST TIMESLOT AVAILABILITY
	this.lookup = function(user){
		if(user && user.firstName && user.lastName && user.dob && user.dob.year && user.dob.month && user.dob.day){
			console.log(user)
			$http.post('/auth/guest', {
				firstName: user.firstName,
				lastName: user.lastName,
				dob: user.dob
			}).success(function(data, status, headers, config){
				if (data.content.available == true) {
					$scope.currentSelect +=1;
					$scope.submitSuccess = false;
					$http.post('/appointments/availability').success(function(data, status, headers, config){
						console.log(data);
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
				} 
				else if(data.content.available == 'notFound'){
					$scope.currentSelect = -10;
				}

				else {
					me.lastVisit.date = new Date(data.content.available[0]).toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
					me.lastVisit.timeSlot = me.timeArrayToString(data.content.available[1]);
					$scope.currentSelect = -8;
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
	//TODO: INTERNATIONALIZE THIS. BECAUSE 'TO' ISN'T IN ALL LANGUAGES
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

	//shows the waitlist info page
	this.showWaitlist = function(){
		$scope.currentSelect = -7;
	}

	//helper function to close buttons
	//first sets all properties of waitlists
	//then sets all timeslots that have passed to closed
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
	this.dateOptions = {weekday: 'long', month: 'long', day: 'numeric'};
	$scope.dateSlots = [this.today.toLocaleString($scope.langKey, this.dateOptions), this.tomorrow.toLocaleString($scope.langKey, this.dateOptions)];
	this.selectDate = function(dateChoice){
		this.dateSelect = $scope.dateSlots[dateChoice];
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
		myYear = me.today.getFullYear() - 14 - $("#dobyear").val();
		myMonth = $("#dobmonth").val();
		myCurrentDate = $("#dobdate").val();
		myDates = range(1, 31, 1);
		if(myYear != '?' && myMonth != '?'){
			myDates = this.monthDayPairs[myMonth];
			if(myYear % 4 === 0 && myMonth == 1){
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
			if(rbag == 'YES'){
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
	};

	this.cancel = function(user){
		$http.post('/appointments/cancel',{
			firstName: user.firstName,
			lastName: user.lastName,
			birthday: user.dob
		}).success(function(data, status, headers, config){
			me.reset();
		})
	}

}); //end of controller 

}()); //end of wrapper, run the wrapper