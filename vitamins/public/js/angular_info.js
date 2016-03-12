var angular_app = angular.module('app', []);
angular_app.controller('VitaminsController', function($scope, $attrs) {
	$scope.init = function(vitamins){
		$scope.vitamins = JSON.parse(vitamins);
		$scope.selected_vitamins = [];
		$scope.dose_amount = 0;
		$scope.num_times_per_day = 0;
		$scope.MakeRanges();
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
	$scope.CalculateTotalPrice = function(){
		var price = 0
       	var prices = document.getElementsByName('price');
		for (vit_index in prices){
			if (prices[vit_index].value != null)
        		price += Number(prices[vit_index].value);
        }
		return price.toFixed( 2 )
	}
	var result = []
	$scope.MakeRange = function(range, numInputs){
		if (typeof(range) == "number"){
			result = [];
			increment = parseInt(range)/numInputs;
			for(var i = 1; i <= parseInt(range); i+=increment){
				result.push({'value':i});
			}
		} else {
			arr = range.split(":");
			var difference = arr[1] - arr[0];
			var increment = difference/numInputs;
			var num = parseInt(arr[0]);
			result = [{'value':num}];
			for(var i = 0; i < 10; i++){
				num += increment;
				result.push({'value':num});
			}
		}
		return result;
	};
	$scope.MakeRanges = function(range, numInputs){
		for (index in $scope.vitamins){
			vitamin = $scope.vitamins[index];
			vitamin.dosages = $scope.MakeRange(vitamin.dose_range,10);
			vitamin.tpd = $scope.MakeRange(vitamin.times_per_day,vitamin.times_per_day);
		}
	};
	


	
});
angular_app.controller('ConfirmationController', function($scope) {
	$scope.init = function(data){
		$scope.data = JSON.parse(data)
		$scope.vitamin_info = $scope.data.vitamin_info
		$scope.user_address_info = $scope.data.user_address_info
		$scope.total_price = $scope.data.total_price
	}
	$scope.GetAddress = function(){
		a = $scope.user_address_info
		return a.street + ", " + a.city + " " + a.state + ", " + a.zip_code
	}
});

angular_app.controller('OrderSuccessful', function($scope) {
	$scope.init = function(order_id){
		$scope.order_id = order_id;
	}
});
angular_app.controller('NewUser',function($scope, $http){
	$scope.genders = [{'value':'male', 'label':"Male"},
	{'value':'female', 'label':"Female"}];
	$scope.submitted = 'not_attempted';
	$scope.signUp = function(formValid) {
		console.log(formValid);
		if (formValid == false ){
			$scope.submitted = 'failed';
			return false
		}
		$http.post('/create_user', {msg:' hello word!'}).
          success(function(data, status, headers, config) {
          	console.log('uop')
            // this callback will be called asynchronously
            // when the response is available
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log('uopsadfsda')
          });
	}
			
});
