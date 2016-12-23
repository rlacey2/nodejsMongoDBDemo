var appControllers = angular.module('appControllers', []);
 

  appControllers.controller('PlaceboCtrl', ['$rootScope','$scope'  ,
        function($rootScope,$scope) {
      // a global controller in case needed
          console.log("PlaceboCtrl"); 

      		$rootScope.recaptchaCodeAvailable = false;			
 
 		}]); // PlaceboCtrl
 
appControllers.controller('HomeCtrl', ['$scope' ,
		function($scope) {
			
			$scope.name= "AngularNode101";
	 
		}]); // HomeCtrl
	
 
	
appControllers.controller('AboutCtrl', ['$scope', 
  function($scope) {
  
  }]); // AboutCtrl		
	
	
appControllers.controller('StudentsCtrl', [  '$scope', '$resource', '$http',  '$q', 'nrzLightify',
    function( $scope, $resource,  $http, $q, nrzLightify) {
		
		var correctIndex; // ng-repeat orderBy order different to the underlying source array
		var editMode;		
		
		$scope.edittingStudent = false;		
		$scope.asynchWait = false;
		$scope.filterData = {};
		$scope.newStudentRaw = {"json" : ""};
		$scope.editId = null;
				 
		$scope.requeryStudents = function(filters)
		{	 
			displayStudents(filters);
		}

		$scope.reset = function()
		{
			$scope.filterData = {};
			displayStudents({});
		}
	
		$scope.deleteStudent = function(index,id, student)
		{
			correctIndex =   $scope.students.indexOf(student);
			$http.delete('/api/v1/student/'+ id).then(function success (response) {  	
			                    $scope.students.splice(correctIndex, 1);
								nrzLightify({ type: 'success', text: 'student deleted'  }, 3000);	
							}, function errorCallback(error) {
                               	nrzLightify({ type: 'danger', text: 'student deletion error'  }, 3000);				 						 
						}); 				
		}
			
		$scope.insertStudent2 = function() // v2
		{
			$http.put('/api/v1/student', $scope.newStudentRaw.json).then(function success (response) {  									
								$scope.newStudentRaw = {"json" : ""};										
								nrzLightify({ type: 'success', text: 'student inserted'  }, 3000);	
							}, function errorCallback(error) {
                               	nrzLightify({ type: 'danger', text: 'student insertion error'  }, 3000);						 						 
						}); 		
		}	

		$scope.insertStudent = function(newStudent) // v1
		{
			$http.put('/api/v1/student', newStudent).then(function success (response) {  									
								$scope.newStudentRaw = {"json" : ""};										
								nrzLightify({ type: 'success', text: 'student inserted'  }, 3000);	
							}, function errorCallback(error) {
                               nrzLightify({ type: 'danger', text: 'student insertion error'  }, 3000);							 						 
						}); 		
		}
		
		
		$scope.loadStudents = function() // load many
		{ // add test data
		    $scope.asynchWait = true;
			$http.post('/api/v1/loadstudents', {}).then(function success (response) {  	
			                    // var result = {'errorFlag' : errorFlag , 'insertCount' : insertCount};
								displayStudents({});
								$scope.asynchWait = false;
								nrzLightify({ type: 'success', text: 'students loaded'  }, 3000);
							}, function errorCallback(error) {
								$scope.asynchWait = false;
                               nrzLightify({ type: 'danger', text: 'student load error'  }, 3000);						 						 
						}); 			 
		}	

		$scope.deleteStudents = function() // load many
		{ // add test data
		    $scope.asynchWait = true;		
			$http.delete('/api/v1/deletestudents', {}).then(function success (response) {  	
			                    // var result = {'errorFlag' : errorFlag , 'insertCount' : insertCount};
								displayStudents({});
								$scope.asynchWait = false;
								nrzLightify({ type: 'success', text: 'students deleted'  }, 3000);
							}, function errorCallback(error) {
								$scope.asynchWait = false;
                               nrzLightify({ type: 'danger', text: 'students deletion error'  }, 3000);						 						 
						}); 			 
		}	 
		
		function getStudents()
		{
			/*
			// you would use this style if chaining i.e. return deferred and resolve/reject as late as possible
			var deferred = $q.defer();
			return $http.get('/api/v1/students', { })  // returns a promise 
						.then(function success (response) {  					
								deferred.resolve(response.data);
							}, function errorCallback(error) {
 
								deferred.reject(error);								 
						});	
			return deferred.promise;	
			*/
     
         return $http.post('/api/v1/students', $scope.filterData); 			
		}		
 		
		var aPromise;
		
		
		function displayStudents(filters)
		{ 		
			aPromise = getStudents(filters);
			
			aPromise.then(function(response) 
						  {
							$scope.students = response.data;
						  },
						  function error(error)
						  {
							  $scope.students = [];					  
						  });
		}
			
		$scope.getTemplate = function (student) {
			//if (contact.id === $scope.model.selected.id) return 'edit';
			//else return 'display';
			return 'displaystudent';
		};		
		
		$scope.cancelStudentEdit = function()
		{
			$scope.edittingStudent = false;
		}
 		
		$scope.editStudent = function(index,id,student)
		{
			$scope.editTitle = "Edit Student";
			editMode = "existing";
			$scope.edittingStudent = true;
			correctIndex =   $scope.students.indexOf(student);
			$scope.editData = angular.copy($scope.students[correctIndex]);
			$scope.editData.index = index + 1;
			$scope.editData._id = id;
		}	

		$scope.saveStudent = function()
		{
			$scope.edittingStudent = false;
			
			if (editMode === "existing")
			{
			var dataToSave = angular.copy($scope.editData);
			delete dataToSave.index;
			$http.post('/api/v1/student', dataToSave).then(function success (response) {  	
			                    $scope.students[correctIndex] = $scope.editData;
								$scope.asynchWait = false;
								nrzLightify({ type: 'success', text: 'student saved'  }, 3000);
							}, function errorCallback(error) {
								$scope.asynchWait = false;
                               nrzLightify({ type: 'danger', text: 'student save error'  }, 3000);					 						 
						}); 
            }		
            else
			{
				delete $scope.editData.index;
				$scope.insertStudent($scope.editData); // put operation
			}				
		}		
		
		$scope.newStudent = function()
		{
			$scope.editTitle = "New Student";
			editMode = "new";
			$scope.edittingStudent = true;
			correctIndex =   -1;
			$scope.editData = {};
			$scope.editData.index = -1;
			$scope.editData._id = null;			
		}
		
		displayStudents({}); // load the students at the start
		nrzLightify({ type: 'success', text: 'Students loaded'  }, 6000);	
 
		}]); // StudentsCtrl
 