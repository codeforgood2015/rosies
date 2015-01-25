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
		'EXIT' : 'exit',

		//errors
		'ERROR' : 'Error',
		'NOT_FOUND' : 'Your information was not found in the database',
		'CONTACT' : "call Patricia Jones in Rosie's Place at 617-318-0236 for assistance",
		'TRY_AGAIN_OR' : 'please try again or',
		'REMINDER' : 'Reminder',
		//need: you have already visited the food pantry
		'YOUR_APPOINTMENTS_DATE' : 'You are signed up for',
		'YOUR_APPOINTMENTS_TIME' : 'Your timeslot is',
		'PRESS_CANCEL' : 'press "cancel" to cancel this appointment and make a new one',
		'PRESS_EXIT' : 'press "exit" to close this page',
		'CANCEL' : 'cancel',

		//waitlist
		'WAITLIST' : 'Waitlist',
		'WAITLIST_STATEMENT' : 'You signed up for a waitlist time',
		'WAITLIST_INFO' : 'Waitlist means you may show up, and you will get a spot if people with appointments do not show up',
		'SELECT_DIFF' : 'select a different time',
		'CONTINUE_ANYWAYS' : 'continue anyways'


	});

	//spanish
	//provided by Antonio Moreno MIT '15 
	$translateProvider.translations('es', {
		//header
		'LOGO_CAPTION' : 'despensa de comida',
		'BACK' : 'regresar',

		//months
		'JANUARY' : 'enero',
		'FEBRUARY' : 'febrero',
		'MARCH' : 'marzo',
		'APRIL' : 'abril',
		'MAY' : 'mayo',
		'JUNE' : 'junio',
		'JULY' : 'julio',
		'AUGUST' : 'agosto',
		'SEPTEMBER' : 'septiembre',
		'OCTOBER' : 'octubre',
		'NOVEMBER' : 'noviembre',
		'DECEMBER' : 'diciembre',

		//page 1
		'LOG_IN' : 'Iniciar una cita ',
		'FIRST_NAME' : 'Nombre propío',
		'LAST_NAME' : 'Apellido',
		'DATE_OF_BIRTH' : 'Fecha de Nacimiento',
		'CONTINUE' : 'empezar',

		//page1 errors
		'MISSING_FIRST' : 'porfavor ingrese su nombre propío',
		'MISSING_LAST' : 'porfavor ingrese su apellido',
		'MISSING_DOB' : 'porfavor ingrese su fecha de nacimiento',

		//page2
		'SELECT_A_DATE' : 'elija una fecha para su cita',
		'TODAY' : 'hoy',
		'TOMORROW' : 'mañana',

		//page3
		'SELECT_A_TIME' : 'elija una hora para su cita',

		//page4
		'PREMADE_BAG' : 'bolsita pre-hecha',
		'YES' : 'si',
		'NO' : 'no',
		'MAKE_BAG': 'bolsita pre-hecha',
		'I_CHOOSE': 'quiero escoger mi propia comida',

		//page5
		'CONFIRMATION' : 'confirmacion',
		'NAME' : 'nombre y apellido',
		'DATE' : 'fecha que escojio', 
		'TIME' : 'hora que escojio',
		'SUBMIT' : 'completar su orden',
		'SUCCESS' : 'orden registrada!',
		'PRINT' : 'imprimir una copia',
		'EXIT' : 'salir',

		//errors
		'ERROR' : 'Error',
		'NOT_FOUND' : 'su informacion no esta registrada',
		'CONTACT' : "contacte a Patricia Jones a 617-318-0236 para asistencia",
		'TRY_AGAIN_OR' : 'Porfavor trate de Nuevo, o',
		'REMINDER' : 'notificacion',
		//need: you have already visited the food pantry
		'YOUR_APPOINTMENTS_DATE' : 'ya esta registrada para una cita en',
		'YOUR_APPOINTMENTS_TIME' : 'su hora de cita es',
		'PRESS_CANCEL' : 'oprima (cancelar) para cancelar su cita, y podra hacer otra cita',
		'PRESS_EXIT' : 'oprima (salir) para cerrar esta pagina',
		'CANCEL' : 'cancelar',

		//waitlist
		'WAITLIST' : 'lista de espera',
		'WAITLIST_STATEMENT' : 'se registro para un lugar en la lista de espera',
		'WAITLIST_INFO' : 'la lista de espra no garantiza un lugar, pero posiblemente le reserva un lugar en caso de que alguien mas no llegue a su citap',
		'SELECT_DIFF' : 'selecione una hora diferente',
		'CONTINUE_ANYWAYS' : 'continuar con su seleccion'
	});

	//chinese
	//provided by Natalle Yu MIT '15
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
		'EXIT' : '退出',

		//errors
		'ERROR' : '错误',
		'NOT_FOUND' : '你的资料不在记录里',
		'CONTACT' : "致电Patricia Jones (617-318-0236)",
		'TRY_AGAIN_OR' : '请再尝试或',
		'REMINDER' : '提示',
		//need: you have already visited the food pantry
		'YOUR_APPOINTMENTS_DATE' : '你登记的日期是',
		'YOUR_APPOINTMENTS_TIME' : '时间是',
		'PRESS_CANCEL' : '如果要取消这个登记，请按取消',
		'PRESS_EXIT' : '如果要退出，请按取消',
		'CANCEL' : '取消',

		//waitlist
		'WAITLIST' : '候补名单',
		'WAITLIST_STATEMENT' : '你已经被登记在候补名单内',
		'WAITLIST_INFO' : '候补名单的意思是如果已经登记了的人没有来你可以取代他们的位置',
		'SELECT_DIFF' : '请选择另一个时间',
		'CONTINUE_ANYWAYS' : '继续'
	});

	//portuguese
	//provided by Francisco Machado MIT '16
	$translateProvider.translations('pt', {
	//header
	'LOGO_CAPTION' : 'Registrar para a Dispensa',
	'BACK' : 'voltar a trás',

	//months
	'JANUARY' : 'Janeiro',
	'FEBRUARY' : 'Fevereiro',
	'MARCH' : 'Março',
	'APRIL' : 'Abril',
	'MAY' : 'Maio',
	'JUNE' : 'Junho',
	'JULY' : 'Julho',
	'AUGUST' : 'Agosto',
	'SEPTEMBER' : 'Setembro',
	'OCTOBER' : 'Outobro',
	'NOVEMBER' : 'Novembro',
	'DECEMBER' : 'Dezembro',

	//page 1
	'LOG_IN' : 'Entrar',
	'FIRST_NAME' : 'Nome',
	'LAST_NAME' : 'Apelido',
	'DATE_OF_BIRTH' : 'Data de Nascimento',
	'CONTINUE' : 'continuar',

	//page1 errors
	'MISSING_FIRST' : 'coloque o seu nome por favor',
	'MISSING_LAST' : 'coloque o seu apelido por favor',
	'MISSING_DOB' : 'coloque o sua data de nascimento',

	//page2
	'SELECT_A_DATE' : 'Selecione uma data',
	'TODAY' : 'hoje',
	'TOMORROW' : 'amanhã',

	//page3
	'SELECT_A_TIME' : 'Selecione uma hora',

	//page4
	'PREMADE_BAG' : 'Saco pré-feito',
	'YES' : 'SIM',
	'NO' : 'NÃO',
	'MAKE_BAG': 'Faz-me um saco',
	'I_CHOOSE': 'Quero escolher a minha própria comida',

	//page5
	'CONFIRMATION' : 'Confirmação',
	'NAME' : 'Nome',
	'DATE' : 'Data', 
	'TIME' : 'Hora',
	'SUBMIT' : 'Submeter',
	'SUCCESS' : 'Guardado com sucesso!',
	'PRINT' : 'imprimir página',
	'EXIT' : 'sair',

	//errors
	'ERROR' : 'Erro',
	'NOT_FOUND' : 'A sua informação não foi encontrada na base de dados',
	'CONTACT' : "telefone à Patricia Jones na Rosie Place Pantry pelo número 617-318-0236 para assistência",
	'TRY_AGAIN_OR' : 'Por favor tente de novo ou',
	'REMINDER' : 'Lembrete',
	//need: you have already visited the food pantry
	'YOUR_APPOINTMENTS_DATE' : 'Está registado para o',
	'YOUR_APPOINTMENTS_TIME' : 'A sua reserva é às',
	'PRESS_CANCEL' : 'Pressione “cancelar” para cancelar este registo e fazer um novo',
	'PRESS_EXIT' : 'Pressione “sair” para fechar',
	'CANCEL' : 'cancelar',

	//waitlist
	'WAITLIST' : 'List de espera',
	'WAITLIST_STATEMENT' : 'Inscreveu-se para a lista de espera',
	'WAITLIST_INFO' : 'A lista de espera significa que pode aparecer, e terá um lugar se as pessoas com reservas não aparecerem',
	'SELECT_DIFF' : 'Selecione uma hora diferente',
	'CONTINUE_ANYWAYS' : 'Continuar à mesma'
	});

	//haitian creole
	//provided by a guest of Rosie's Place
	$translateProvider.translations('ht', {
	//header
	//'LOGO_CAPTION' : '', //missing
	'BACK' : 'pa tras',

	//months
	'JANUARY' : 'Janeiro',
	'FEBRUARY' : 'Fevereiro',
	'MARCH' : 'Marco',
	'APRIL' : 'Abril',
	'MAY' : 'Maio',
	'JUNE' : 'Junho',
	'JULY' : 'Julho',
	'AUGUST' : 'Agosto',
	'SEPTEMBER' : 'Setembro',
	'OCTOBER' : 'Outobro',
	'NOVEMBER' : 'Novembro',
	'DECEMBER' : 'Dezembro',

	//page 1
	'LOG_IN' : 'Conecte -se',
	'FIRST_NAME' : 'Primeiro Nome',
	'LAST_NAME' : 'Sobrenome',
	'DATE_OF_BIRTH' : 'Data de Nascimento',
	//'CONTINUE' : '', //missing

	//page1 errors
	//'MISSING_FIRST' : '', //missing
	//'MISSING_LAST' : '', //missing
	//'MISSING_DOB' : '', //missing

	//page2
	'SELECT_A_DATE' : 'Escolher um Data',
	'TODAY' : 'ahoje',
	'TOMORROW' : 'manha',

	//page3
	'SELECT_A_TIME' : 'Escolher uma hora',

	//page4
	'PREMADE_BAG' : 'Saco pré-feito',
	'YES' : 'SI',
	'NO' : 'NÃO',
	'MAKE_BAG': 'Fazem um bolsa',
	'I_CHOOSE': 'Um kre escolher nha comida',

	//page5
	'CONFIRMATION' : 'Confirmacao',
	'NAME' : 'Nome',
	'DATE' : 'Data', 
	'TIME' : 'Hora',
	//'SUBMIT' : '', //missing
	//'SUCCESS' : '', //missing
	//'PRINT' : '', //missing
	//'EXIT' : '' //missing

	//errors
	//'ERROR' : '', //missing
	//'NOT_FOUND' : '', //missing
	//'CONTACT' : '', //missing
	//'TRY_AGAIN_OR' : '', //missing
	//'REMINDER' : '', //missing
	//need: you have already visited the food pantry
	//'YOUR_APPOINTMENTS_DATE' : ''', //missing
	//'YOUR_APPOINTMENTS_TIME' : '', //missing
	//'PRESS_CANCEL' : '', //missing
	//'PRESS_EXIT' : '', //missing
	//'CANCEL' : ''', //missing

	//waitlist
	//'WAITLIST' : '', //missing
	//'WAITLIST_STATEMENT' : '', //missing
	//'WAITLIST_INFO' : '', //missing
	//'SELECT_DIFF' : '', //missing
	//'CONTINUE_ANYWAYS' : '', //missing
	});	

	$translateProvider.preferredLanguage('en');
	$translateProvider.fallbackLanguage(['en']);
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
	this.lastVisit.dateReal = '';
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
		if(me.lastVisit.dateReal && me.lastVisit.dateReal != ''){
			me.lastVisit.date = me.lastVisit.dateReal.toLocaleString(langKey, me.dateOptions);
		}
		$translate.use(langKey);
	}

	//CLEARS ALL USER DATA AND SETS ALL BACK TO DEFAULTS
	//CALLED ON EXIT BUTTON AND ON HITTING BACK TO THE FRONT PAGE
	this.reset = function(){
		$scope.langKey = 'en';
		$scope.changeLanguage('en');
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
					//lastvisit means current appointment... :(
					me.lastVisit.dateReal = new Date(data.content.available[0])
					me.lastVisit.date = me.lastVisit.dateReal.toLocaleString($scope.langKey, me.dateOptions);
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