var epicsApp = angular.module('epicsApp', ['ngCookies', 'ngSanitize']).controller('mainController', ['$scope', '$http','$cookies', function ($scope, $http, $cookies) {
  	console.log('mainController.init: '+$cookies.username);

	$http.get('/config').success(function(data) {
			$scope.config = data;	
		  	if($cookies.username) {
		  		console.log('Setting username to '+$cookies.username);
				$scope.username = $cookies.username;	
		  	}else{
			  	$scope.username = $scope.config.defaultusername;
		  	}
	}).error(function(data) {
    		console.log('Error: ' + data);
	});

  	$scope.password = '';

  	let baseUrl = 'proxy/jira/rest/api/latest/search?expand=renderedFields';
  	let agileUrl = 'proxy/jira/rest/agile/1.0/issue/rank';

	$scope.toDefaultLabelFilter = function(){
		$scope.labelFilter = 'labels=PPM';
	}

  	$scope.toDefaultLabelFilter();

	$scope.addToLabelFilterAndFetch = function(label) {
		$scope.labelFilter = $scope.labelFilter +' AND labels='+ label;
		console.log('filtering to '+$scope.labelFilter);
		$scope.fetch();
	};

	$scope.resetAndFetch = function(){
		$scope.toDefaultLabelFilter();
		console.log('filtering to '+$scope.labelFilter);
		$scope.fetch();	
	};

	$scope.showFilter = function(){
		same = $scope.labelFilter == 'labels=PPM';
		return !same;
	};

	// splits feature description from '---'
	$scope.splitter = function(string) {
    	if( string ){
	    	var array = string.split('<p>&#8212;</p>');
	    	return array[0];    		
    	}else{
    		return '';
    	}
	};

	// simple helper to map jira statuses
	$scope.inProgress = function(status) {
    	if( status && (status.name == 'Tested' || status.name == 'In Progress') ){
	    	return true;    		
    	}else{
    		return false;
    	}
	};

	$scope.criticality = function(label){
		if(label == 'blocked')
			return 'warning';
		else
			return 'info';
	}

	getBasicAuth = function(){
		var userstring = $scope.username+':'+$scope.password;
		var basicauth = 'Basic '+window.btoa(userstring);
		var headers = new Headers();
      	headers.append("Authorization", basicauth);
      	headers.append("Content-Type", "application/json");
		return headers;		
	}

	$scope.fetch = function () {

		$cookies.username = $scope.username;
      	console.log('feching with '+$scope.labelFilter);

		$http.get(baseUrl+ '&jql='+$scope.config.jql+' AND '+$scope.labelFilter+' ORDER BY '+$scope.config.orderby, 
			{headers: getBasicAuth()}
	    ).success(function(data) {
			console.log(data);
			$scope.tickets = data;	
  		}).error(function(data) {
    		console.log('Error: ' + data);
  		});
	};

	$scope.rank = function(moving, anchor){

		console.log("moving "+moving+' before '+anchor);

		var body = {
		    "issues": [moving],
    		"rankBeforeIssue": anchor,
		    "rankCustomFieldId": $scope.config.rankfield
		}

		var headerList = getBasicAuth();

		$http( 
			{
			method: "put",
			url:agileUrl,
			headers: headerList,
			data: body
			}
	    ).success(function(data) {
			console.log('rank success');
			$scope.fetch();
  		}).error(function(data) {
    		console.log('Error: ' + JSON.stringify(data));
  		});


	}
}
]);