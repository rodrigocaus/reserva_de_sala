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

	$scope.resultado = "";

	$scope.fazLogin = function () {

		if (!($scope.user.matricula) || $scope.user.matricula.trim().length === 0 ||
			!($scope.user.senha) || $scope.user.senha.trim().length === 0) {
			$scope.resultado = "Todos os campos são obrigatórios";
			$scope.user.senha = "";
			return;
		}

		var url = '/login';
		var data = { "matricula": $scope.user.matricula, "senha": $scope.user.senha };
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
				$scope.user.matricula = "";
				$scope.user.senha = "";
			});
	};

	$scope.redirecionaCadastro = function () {
		$window.location.href = '/cadastro.html';
	}

	$scope.fazCadastro = function () {

		if (!($scope.cadastro.matricula) || $scope.cadastro.matricula.trim().length === 0 ||
			!($scope.cadastro.nome) || $scope.cadastro.nome.trim().length === 0 ||
			!($scope.cadastro.senha) || $scope.cadastro.senha.trim().length === 0 ||
			!($scope.cadastro.senhaconfirma) || $scope.cadastro.senhaconfirma.trim().length === 0) {

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
		var data = {
			"nome": $scope.cadastro.nome,
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

ng_module.controller('indexCtrl', function ($scope, $http, $mdDialog , $window) {

	$scope.resposta = '';

	$scope.myDate = new Date();

	$scope.reserva = {
		evento: '',
		descricao: '',
		autor: '',
		data: '',
		sala: '',
		inicio: 0,
		fim: 0
	};

	$scope.foo = function () {
		let datastr = $scope.myDate.getDate() + '/' + ($scope.myDate.getMonth() + 1) + '/' + $scope.myDate.getFullYear();
		$scope.resposta = datastr;
	}

	$scope.toggle = function (sala, hora) {
		if ($scope.celula[hora][sala] == '') {
			$scope.celula[hora][sala] = "Reservado";
			$scope.resposta = sala + ' ' + hora;
		}
		else {
			$scope.celula[hora][sala] = '';
			$scope.resposta = '';
		}
		// TODO Chamar a função que exibe mais informações da reserva e possibilitita a reserva/alteração/cancelamento
	}

	$scope.mostraInfoReserva = function (sala, hora, ev) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.confirm()
			.clickOutsideToClose(true)
			.title('Voce clicou nessa sala?')
			.textContent("Sala: " + sala + " e hora: " + hora)
			.ariaLabel('Lucky day')
			.targetEvent(ev)
			.ok('Tá certo mesmo')
			.cancel('ERRRROOUU!!!');

		$mdDialog.show(confirm).then(function () {
			$scope.resposta = 'Voce clicou na sala certa.';
		}, function () {
			$scope.resposta = 'Voce errou a sala.';
		});
	};

	$scope.mostraFormReserva = function (sala, hora, ev) {
		$scope.reserva.inicio = hora;
		$scope.reserva.sala = $scope.salas[sala];
		$scope.reserva.data = $scope.myDate.getDate() + '/' + ($scope.myDate.getMonth() + 1) + '/' + $scope.myDate.getFullYear();
		$mdDialog.show({
			controller: DialogController,
			templateUrl: 'info-reserva.tpl.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
			.then(function (answer) {
				var data = JSON.stringify($scope.reserva);
				$scope.resposta = data; //TODO: Tirar isso quando estiver pronto e testado
				var url = '/reservas';

				var request = $http({
					"method": "post",
					"url": url,
					"data": data
				});
				request.then(function successCallback(response) {
					console.log(response.data);
					$scope.resultado = "Reserva efetuada com sucesso!";
					$window.location.reload(true);
				},
					function errorCallback(response) {
						console.log(response.data);
						if (response.status == 401) {
							$scope.resultado = "Matricula ou senha incorretos";
						}
						else {
							$scope.resultado = "Falha de acesso";
						}
						$scope.user.matricula = "";
						$scope.user.senha = "";
					});
					
			}, function () {
				$scope.resposta = '';
			});
	};

	function DialogController(scope, $mdDialog) {
		scope.evento = '';
		scope.descricao = '';
		scope.inicio = $scope.reserva.inicio;
		scope.fim = scope.inicio + 1;
		//scope.resultado = "";

		scope.hide = function () {
			$mdDialog.hide();
		};

		scope.cancel = function () {
			$mdDialog.cancel();
		};

		scope.resposta = function (resposta) {
			if (!(scope.evento) || scope.evento.trim().length === 0 ||
				!(scope.descricao) || scope.descricao.trim().length === 0) {
				scope.evento = "";
				scope.descricao = "";
				scope.resultado = "Todos os campos são obrigatórios!";
			}
			else {
				$scope.reserva.evento = scope.evento;
				$scope.reserva.descricao = scope.descricao;
				$scope.reserva.fim = scope.fim;
				scope.resultado = "";
				$mdDialog.hide(resposta);
			}
		};

		scope.range = function (begin, end, step) {
			var array = [];
			for (var i = begin; i <= end; i += step) {
				array.push(i);
			}
			return array;
		};
	}
});

ng_module.config(function ($mdDateLocaleProvider) {

	$mdDateLocaleProvider.formatDate = function (date) {
		return moment(date).format('DD/MM/YYYY');
	};

});

ng_module.directive('myTable', function () {
	return {
		restrict: 'A',
		templateUrl: 'tabela-reservas.tpl.html',
		link: function (scope, element, attributes) {
			var _salas = ['FE01', 'FE02', 'FE03', 'FE11', 'FE12', 'FE13'];
			var _celula = new Array(24);
			for (let i = 0; i < 24; i++) {
				_celula[i] = new Array(_salas.length).fill('');
			}

			function _range(begin, end, step) {
				var array = [];

				for (var i = begin; i <= end; i += step) {
					array.push(i);
				}
				return array;
			}
			function _init() {
				scope.range = _range;
				scope.salas = _salas;
				scope.celula = _celula;
			}
			_init();
		}
	};
});
