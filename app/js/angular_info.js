var angular_app = angular.module('app', []);

var tax_percentage= 8.75;

angular_app.factory('myService', function(){
	return{
		CalculatePrice: function(prices, number_of_pills){
			if (!number_of_pills)
				return Number(0).toFixed(2);
			var price = 0;
			for (vit_index in prices){
				if (prices[vit_index] != null)
		        	price += Number(prices[vit_index]);
	    	}
	        price = price * number_of_pills;
			return price.toFixed(2);
		},
		GetObjectById: function(array, id){
			for (obj_idx in array){
				if (array[obj_idx]._id === id) 
					return array[obj_idx];
			}
			return null;
		}
	};
});

angular_app.controller('VitaminsController', function($scope, $attrs, myService) {
	$scope.init = function(data){
		data = JSON.parse(data);
		$scope.vitamins = Object.keys(data.vitamins).map(function(key) {return data.vitamins[key];});
		// $scope.build_vitamin_info = data.build_vitamin_info;
		$scope.selected_vitamins = [];
		$scope.dose_amount = 0;
		$scope.num_times_per_day = 0;
		$scope.MakeTimePerDayRange();
	}
	$scope.custom_vitamin_price = function(){
		var page_prices = document.getElementsByName('price');
		prices = [];
		for (vit_index in page_prices){
			if (page_prices[vit_index].value != null)
	        	prices.push(Number(page_prices[vit_index].value));
	    }
		return myService.CalculatePrice(prices, $scope.number_of_pills);
	};
	$scope.AddOrRemoveVitamin = function(vitamin){
		var index = $scope.selected_vitamins.indexOf(vitamin);
		 if (index > -1){ //Remove element
		 	$scope.vitamins[$scope.vitamins.indexOf(vitamin)].Selected=false; //Uncheck checkbox
			$scope.selected_vitamins.splice(index, 1);
		} else{ //Add element
			$scope.selected_vitamins.push(vitamin);
		}
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
	$scope.MakeTimePerDayRange = function(range, numInputs){
		var max_tpd = 0;
		for (index in $scope.vitamins){
			vitamin = $scope.vitamins[index];
			if (vitamin.times_per_day > max_tpd)
				max_tpd = vitamin.times_per_day;
		}
		$scope.max_tpd_range =  $scope.MakeRange(max_tpd,max_tpd);
	};	
});
angular_app.controller('CartController', function($scope, $attrs, $http, myService) {
	$scope.init = function(data){	
		data = JSON.parse(data);
		var cart_items = data.cart_items;
		$scope.vitamins = data.vitamins;
		$scope.cart = [];
		$scope.save_for_later = [];
		$scope.subtotal = 0;
		for (index in cart_items){
			var cart_item = cart_items[index];
			custom_vitamin = cart_item["custom_vitamin"][0];
			custom_vitamin.vitamin_names = [];
			prices = [];

			for (id_index in custom_vitamin.vitamin_id){
				// vitamin = $scope.vitamins[custom_vitamin.vitamin_id[id_index]];
				price_per_unit = 0
				vitamin = myService.GetObjectById($scope.vitamins, custom_vitamin.vitamin_id[id_index]);
				custom_vitamin.vitamin_names.push(vitamin.name);
				prices.push(vitamin.price_per_unit * custom_vitamin.dosage[id_index]);
			}
			custom_vitamin.calculated_price = myService.CalculatePrice(prices, custom_vitamin.number_of_pills);
			custom_vitamin.cart_item_id = cart_item._id;
			if (cart_item.status == "cart"){
				$scope.cart.push(custom_vitamin);
				$scope.subtotal += Number(custom_vitamin.calculated_price); //only within cart
			} else if (cart_item.status == "save_for_later"){
				$scope.save_for_later.push(custom_vitamin);
			}
		}
		$scope.subtotal = $scope.subtotal.toFixed(2);
	}

});
angular_app.controller('CheckoutController', function($scope, $attrs, $http, myService) {
	$scope.init = function(data){	
		data = JSON.parse(data);
		var cart_items = data.cart_items;
		$scope.vitamins = data.vitamins;
		$scope.addresses = data.addresses;
		$scope.tax_percentage = tax_percentage;
		if ($scope.addresses.length > 0){
			$scope.current_address = $scope.addresses[0]; //Hacky, would eventually like to make a default
		}
		$scope.changing_address = false;
		$scope.subtotal = 0;
		$scope.custom_vitamins = [];
		for (index in cart_items){
			var cart_item = cart_items[index];
			custom_vitamin = cart_item["custom_vitamin"][0];
			$scope.custom_vitamins.push(custom_vitamin);
			prices = [];
			for (id_index in custom_vitamin.vitamin_id){
				vitamin = $scope.vitamins[custom_vitamin.vitamin_id[id_index]];
				dosage = custom_vitamin.dosage[id_index];
				prices.push(vitamin.price_per_unit * dosage);
			}
			custom_vitamin.calculated_price = myService.CalculatePrice(prices, custom_vitamin.number_of_pills);
			$scope.subtotal += Number(custom_vitamin.calculated_price); //only within cart
		}
		console.log($scope.custom_vitamins);
		$scope.subtotal = $scope.subtotal.toFixed(2);
	}
	$scope.custom_vitamin_price = function(custom_vitamin){
		var prices = [];
		for (id_index in custom_vitamin.vitamin_id){
			vitamin = $scope.vitamins[custom_vitamin.vitamin_id[id_index]];
			dosage = custom_vitamin.dosage[id_index];
			prices.push(vitamin.price_per_unit * dosage);
		}
		return myService.CalculatePrice(prices, custom_vitamin.number_of_pills);
	};
	$scope.change_address = function(input){
		if (input == 'show'){
			$scope.changing_address = true;
			$scope.old_address = $scope.current_address;
			$scope.current_address = null;
		} else if (input == 'save'){
			if($scope.temp_address){
				$scope.current_address = $scope.temp_address;
			} else {
				$scope.current_address = $scope.old_address;
			}
			
			$scope.changing_address = false;
		} else if (input =='cancel'){
			$scope.current_address = $scope.old_address;
			$scope.changing_address = false;
		}
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








