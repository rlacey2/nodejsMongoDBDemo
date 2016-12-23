var angularnodeApp = angular.module("angularnodeApp", ['ngRoute', 'nrzLightify',
     'appControllers',    'ngResource' ]);

	 
angularnodeApp.run(function( ) {
 // editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

angularnodeApp.config(['$routeProvider','$httpProvider', '$provide',  '$locationProvider',
      function($routeProvider, $httpProvider, $provide,  $locationProvider ) {
// You can not ask for instance during configuration phase - you can ask only for providers.	 
console.log("angularnodeApp.config")	  // runs once only

//  Force AngularJS to call our JSON Web Service with a 'GET' rather than an 'OPTION' 
//  Taken from: http://better-inter.net/enabling-cors-in-angular-js/	  
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];	  
 
			$routeProvider.					
					  when('/home', {
						templateUrl: './partials/home.html',
						controller: 'HomeCtrl'
					  }).												  
					  when('/students', {
						templateUrl: './partials/students.html',
						controller: 'StudentsCtrl'
					  }).						  
					  when('/about', {
						templateUrl: './partials/about.html',
						controller: 'AboutCtrl'
					  }).	 	 						
					  otherwise({
						redirectTo: '/home'
					  });
 			
  }]);