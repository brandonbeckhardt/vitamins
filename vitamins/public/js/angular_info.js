// module.exports = {
// 	SetUpAngular : function(data){
// 		var app = angular.module('app', []);
// 	  	app.controller('VitaminController', ['$scope', function ($scope) {
// 	    // $scope.todos = data;
// 	  }]);
// 	}
// }

var express = require('express');
var app = express();

// Connection to database
pgp = require('pg-promise')(/*options*/);
var db = pgp("postgres:///vitamins");
console.log('test');

var app = angular.module('app', []);
app.controller('VitaminController', ['$scope', function ($scope) {
	db.query("SELECT * from vitamins")
    .then(function (data) {
    	console.log(data);
    	console.log('here');
		$scope.vitamins = data;
	})
    .catch(function (error) {
        console.log("ERROR:", error);
    });
}]);
