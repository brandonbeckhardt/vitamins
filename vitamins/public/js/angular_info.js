console.log('yoo');
var angular_app = angular.module('app', []);
angular_app.controller('VitaminsController', function($scope) {

	$scope.init = function(vitamins){
		$scope.vitamins = JSON.parse(vitamins);
		console.log($scope.vitamins);
		$scope.selected_vitamins = [];
	}
	$scope.AddOrRemoveVitamin = function(vitamin){
		var index = $scope.selected_vitamins.indexOf(vitamin);
		 if (index > -1){ //Remove element
		 	$scope.vitamins[$scope.vitamins.indexOf(vitamin)].Selected=false; //Uncheck checkbox
			$scope.selected_vitamins.splice(index, 1);
		} else{ //Add element
			$scope.selected_vitamins.push(vitamin);
		}
	}
	$scope.MakeRange = function(range, numInputs){
		if (typeof(range) == "number"){
			result = [];
			increment = parseInt(range)/numInputs;
			for(var i = 1; i <= parseInt(range); i+=increment){
				result.push(num);
			}
		} else {
			arr = range.split(":");
			var difference = arr[1] - arr[0];
			var increment = difference/numInputs;
			var num = parseInt(arr[0]);
			var result = [num];
			for(var i = 0; i < 10; i++){
				num += increment;
				result.push(num);
			}
		}
		return result;
	}
});



