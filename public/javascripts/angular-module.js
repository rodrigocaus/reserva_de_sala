var ng_module = angular.module('reservasApp', ['ngMaterial', 'ngMessages']);

ng_module.controller('myCtrl', function ($scope, $http, $window) {

	$scope.myDate = new Date();
	
	$scope.user = {
		matricula: '',
		senha: ''
	};
    
    $scope.popUp = function () {

        alert($scope.myDate.getDate()+'/'+($scope.myDate.getMonth()+1)+'/'+$scope.myDate.getFullYear());
	};
	
	$scope.fazLogin = function () {
		var url = '/login';
		var data = {"matricula": $scope.user.matricula, "senha": $scope.user.senha};
		var request = $http({
			"method": "post",
			"url": url,
			"data": data
		});
		request.then(function successCallback(response) {
			console.log(response.data);
			$window.location.href = '/index.html';
		},
		function errorCallback(response) {
			console.log(response.data);
		});
	};

});

ng_module.config(function ($mdDateLocaleProvider) {

    $mdDateLocaleProvider.formatDate = function (date) {
        return moment(date).format('DD/MM/YYYY');
    };

});

