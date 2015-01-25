(function(){var app = angular.module('splash', []);
app.controller('splashController', function($scope){
	var me = this; //javascript this is the worst thing ever...
	this.current = 0;
	this.go = function(pageNum){
		$('.' + me.current).fadeOut('fast');
		me.current = pageNum;
		$('.' + me.current).fadeIn('medium')
	};

	this.checkCurrent = function(pageNum){
		if(pageNum == me.current){
			return true;
		}
		else{
			return false;
		}
	}
})
})
() //end of wrapper, run the wrapper