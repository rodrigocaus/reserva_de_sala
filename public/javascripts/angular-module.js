var ng_module = angular.module('reservasApp', ['ngMaterial', 'ngMessages']);

ng_module.controller('authenticationCtrl', function ($scope, $http, $window) {
	
	$scope.user = {
		matricula: '',
		senha: ''
	};

	$scope.cadastro = {
		nome: '',
		matricula: '',
		senha: '',
		senhaconfirma: ''
	};
	
	$scope.resultado = '';
	
	$scope.fazLogin = function () {
		
		if ($scope.user.matricula == '' || $scope.user.senha == '') {
			$scope.resultado = "Todos os campos são obrigatórios";
			$scope.user.senha = '';
			return;
		}

		var url = '/login';
		var data = {"matricula": $scope.user.matricula, "senha": $scope.user.senha};
		var request = $http({
			"method": "post",
			"url": url,
			"data": data
		});
		request.then(function successCallback(response) {
			console.log(response.data);
			$scope.resultado = "Sucesso na autenticação!"
			$window.location.href = '/index.html';
		},
		function errorCallback(response) {
			console.log(response.data);
			if (response.status == 401) {
				$scope.resultado = "Matricula ou senha incorretos";
			}
			else {
				$scope.resultado = "Falha de acesso";
			}
			$scope.user.matricula = '';
			$scope.user.senha = '';
		});
	};

	$scope.redirecionaCadastro = function () {
		$window.location.href = '/cadastro.html';
	}

	$scope.fazCadastro = function () {
		
		if ($scope.cadastro.matricula == '' || $scope.cadastro.senha == ''
			|| $scope.cadastro.nome == '' || $scope.cadastro.senhaconfirma == '') {
			$scope.resultado = "Todos os campos são obrigatórios";
			$scope.cadastro.senha = '';
			$scope.cadastro.senhaconfirma = '';

			return;
		}

		if ($scope.cadastro.senha !== $scope.cadastro.senhaconfirma) {
			$scope.resultado = "As senhas não conferem";
			$scope.cadastro.senha = '';
			$scope.cadastro.senhaconfirma = '';

			return;
		}

		var url = '/login';
		var data = 	{	"nome": $scope.cadastro.nome,
						"matricula": $scope.cadastro.matricula, 
						"senha": $scope.cadastro.senha
					};
		var request = $http({
			"method": "put",
			"url": url,
			"data": data
		});
		request.then(function successCallback(response) {
			console.log(response.data);
			$window.location.href = '/login.html';
		},
		function errorCallback(response) {
			console.log(response.data);
			if (response.status == 409) {
				$scope.resultado = "Matrícula já cadastrada";
				$scope.cadastro.matricula = '';
			}
			else if (response.status == 500) {
				$scope.resultado = "Erro no registro do usuário"
			}
			else {
				$scope.resultado = "Falha de acesso";
			}
			$scope.cadastro.senha = '';
			$scope.cadastro.senhaconfirma = '';
		});
	};

	$scope.redirecionaLogin = function () {
		$window.location.href = '/login.html';
	}

	$scope.fazLogout = function () {
		var url = '/login';
		var request = $http({
			"method": "delete",
			"url": url,
			"data": ''
		});
		request.then(function successCallback(response) {
			console.log(response.data);
			$window.location.href = '/login.html';
		},
		function errorCallback(response) {
			console.log(response.data);
			$window.location.href = '/login.html';
		});
	}

});

ng_module.controller('indexCtrl', function($scope, $http) {

	$scope.resposta = '';

	$scope.myDate = new Date();

	$scope.foo = function () {
		let datastr = $scope.myDate.getDate()+'/'+($scope.myDate.getMonth()+1)+'/'+$scope.myDate.getFullYear();
		$scope.resposta = datastr;
	}
});

ng_module.config(function ($mdDateLocaleProvider) {

    $mdDateLocaleProvider.formatDate = function (date) {
        return moment(date).format('DD/MM/YYYY');
    };

});

