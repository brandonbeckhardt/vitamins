var angular_app = angular.module('app', []);
angular_app.controller('VitaminsController', function($scope, $attrs) {
	$scope.init = function(data){
		data = JSON.parse(data);
		$scope.vitamins = data.vitamins;
		$scope.build_vitamin_info = data.build_vitamin_info;
		// console.log($scope.build_vitamin_info);
		console.log($scope.vitamins);
		$scope.selected_vitamins = [];
		$scope.dose_amount = 0;
		$scope.num_times_per_day = 0;
		$scope.MakeTimePerDayRanges();

		// If we need to recreate the filled out form info, goes here!
		if (data.build_vitamin_info != null){
			form = document.getElementById('vitamin_form');
			form.elements = data.build_vitamin_info;
			foundIndex = 0;
		
			$scope.times_per_day = data.build_vitamin_info.times_per_day;
			console.log(data.build_vitamin_info);
			$scope.number_of_pills = parseFloat(data.build_vitamin_info.number_of_pills);
			for (vitaminIndex in $scope.vitamins){
				vitamin = $scope.vitamins[vitaminIndex];
				if (data.build_vitamin_info.vitamin_id.indexOf(vitamin._id) > -1){
					$scope.selected_vitamins.push(vitamin);
					$scope.vitamins[$scope.vitamins.indexOf(vitamin)].Selected=true;
					$scope.vitamins[$scope.vitamins.indexOf(vitamin)].dose_amount=data.build_vitamin_info.dosage[foundIndex];
					$scope.vitamins[$scope.vitamins.indexOf(vitamin)].time_per_day=data.build_vitamin_info.times_per_day[foundIndex];
					$scope.vitamins[$scope.vitamins.indexOf(vitamin)].price=data.build_vitamin_info.price[foundIndex];
					foundIndex++;
				}
			}
		}
	}


	$scope.AddOrRemoveVitamin = function(vitamin){
		var index = $scope.selected_vitamins.indexOf(vitamin);
		 if (index > -1){ //Remove element
		 	$scope.vitamins[$scope.vitamins.indexOf(vitamin)].Selected=false; //Uncheck checkbox
			$scope.selected_vitamins.splice(index, 1);
		} else{ //Add element
			$scope.selected_vitamins.push(vitamin);
			console.log(vitamin);
		}
	}
	$scope.CalculateTotalPrice = function(){
		var price = 0
       	var prices = document.getElementsByName('price');
		for (vit_index in prices){
			if (prices[vit_index].value != null)
        		price += Number(prices[vit_index].value);
        }
        console.log(price);
		return price.toFixed(2);
	}
	var result = []
	$scope.MakeRange = function(range, numInputs){
		if (typeof(range) == "number"){
			result = [];
			increment = parseInt(range)/numInputs;
			for(var i = 1; i <= parseInt(range); i+=increment){
				result.push(i);
			}
		} else {
			arr = range.split(":");
			var difference = arr[1] - arr[0];
			var increment = difference/numInputs;
			var num = parseInt(arr[0]);
			result = [num];
			for(var i = 0; i < 10; i++){
				num += increment;
				result.push(num);
			}
		}
		return result;
	};
	$scope.MakeTimePerDayRanges = function(range, numInputs){
		var max_tpd = 0;
		for (index in $scope.vitamins){
			vitamin = $scope.vitamins[index];
			vitamin.tpd = $scope.MakeRange(vitamin.times_per_day,vitamin.times_per_day);
			if (vitamin.times_per_day > max_tpd){
				max_tpd = vitamin.times_per_day;
			}
		}
		$scope.max_tpd = max_tpd;
		$scope.max_tpd_range =  $scope.MakeRange(max_tpd,max_tpd);
	};	
});
angular_app.controller('CartController', function($scope, $attrs, $http) {
	$scope.init = function(data){	
		data = JSON.parse(data);
		var custom_vitamins = data.custom_vitamins;
		$scope.vitamin_map = data.vitamin_map;
		$scope.cart = [];
		$scope.save_for_later = [];
		for (index in custom_vitamins){
			item = custom_vitamins[index];
			if (item.status == "cart"){
				$scope.cart.push(item);
			} else if (item.status == "save_for_later"){
				$scope.save_for_later.push(item);
			}
		}
		console.log($scope.cart);
	}
});
angular_app.controller('ConfirmationController', function($scope) {
	$scope.init = function(data){
		$scope.data = JSON.parse(data)
		$scope.vitamin_info = $scope.data.vitamin_info
		// $scope.user_address_info = $scope.data.user_address_info
		$scope.total_price = $scope.data.total_price
	}
});

angular_app.controller('OrderSuccessful', function($scope) {
	$scope.init = function(order_id){
		$scope.order_id = order_id;
	}
});
