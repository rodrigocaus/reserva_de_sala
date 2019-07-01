var ng_module = angular.module('reservasApp', ['ngMaterial', 'ngMessages']);


/*************	CONTROLLER RESPONSÁVEL PELO RECURSO DE AUTENTICAÇÃO (LOGIN, CADASTRO,...)	 *************/

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

		// Verifica se os campos estão todos preenchidos
		if (!($scope.user.matricula) || $scope.user.matricula.trim().length === 0 ||
			!($scope.user.senha) || $scope.user.senha.trim().length === 0) {
			$scope.resultado = "Todos os campos são obrigatórios";
			$scope.user.senha = "";
			return;
		}

		// Requisição HTTP POST para fazer login
		var url = '/login';
		var data = { "matricula": $scope.user.matricula, "senha": $scope.user.senha };
		var request = $http({
			"method": "post",
			"url": url,
			"data": data
		});
		request.then(function successCallback(response) {
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


		// Verifica se os campos estão todos preenchidos
		if (!($scope.cadastro.matricula) || $scope.cadastro.matricula.trim().length === 0 ||
			!($scope.cadastro.nome) || $scope.cadastro.nome.trim().length === 0 ||
			!($scope.cadastro.senha) || $scope.cadastro.senha.trim().length === 0 ||
			!($scope.cadastro.senhaconfirma) || $scope.cadastro.senhaconfirma.trim().length === 0) {

			$scope.resultado = "Todos os campos são obrigatórios";
			$scope.cadastro.senha = '';
			$scope.cadastro.senhaconfirma = '';

			return;
		}

		// Verifica se a senha foi digitada corretamente
		if ($scope.cadastro.senha !== $scope.cadastro.senhaconfirma) {
			$scope.resultado = "As senhas não conferem";
			$scope.cadastro.senha = '';
			$scope.cadastro.senhaconfirma = '';

			return;
		}

		// Requisição HTTP PUT para criar um novo cadastro
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

		// Faz requisição HTTP DELETE para apagar o cookie de autenticação
		var url = '/login';
		var request = $http({
			"method": "delete",
			"url": url,
			"data": ''
		});
		request.then(function successCallback(response) {
			$window.location.href = '/login.html';
		},
			function errorCallback(response) {
				console.log(response.data);
				$window.location.href = '/login.html';
			});
	}

});

/*************	CONTROLLER RESPONSÁVEL PELO RECURSO DE RESERVAS (EXIBE, CRIA, CANCELA, ALTERA,...)	 *************/

ng_module.controller('indexCtrl', function ($scope, $http, $mdDialog, $window) {

	$scope.resposta = '';

	// Exibe o dialog de mensagens do servidor
	$scope.mostraResposta = function (str) {

		$mdDialog.show(
			$mdDialog.alert()
				.parent(angular.element(document.querySelector('#popupContainer')))
				.clickOutsideToClose(true)
				.title('')
				.textContent(str)
				.ariaLabel('Resposta do servidor')
				.ok('Ok')
		);
	};

	$scope.myDate = new Date();

	$scope.reserva = {
		evento: '',
		descricao: '',
		autor: '',
		dia: '',
		sala: '',
		inicio: 0,
		fim: 0
	};

	// Pega as reservas do dia conforme o calendário
	$scope.confirmaDia = function () {
		let diastr = $scope.myDate.getDate() + '/' + ($scope.myDate.getMonth() + 1) + '/' + $scope.myDate.getFullYear();
		$scope.resposta = '';
		$scope.pegaReservasDia(diastr);
	}

	// Exibe um formulário de reserva de sala ou informações da reserva dependendo do horário preenchido ou não
	$scope.toggle = function (sala, hora, ev) {
		if (!($scope.celula[hora][sala]) || $scope.celula[hora][sala].trim().length === 0) {
			$scope.mostraFormReserva(sala, hora, ev);
		}
		else {
			$scope.mostraInfoReserva(sala, hora, ev);
		}
	}

	$scope.mostraInfoReserva = function (sala, hora, ev) {

		// Procura na lista de reservas (obtida no GET) qual é a reserva clicada,
		// para os mesmos sala e horário
		var reservaClicada;
		for (let r of $scope.listaDeReservas) {
			if (r.sala == $scope.salas[sala]) {
				for (let h = 0; h < r.horario.length; h++) {
					if (r.horario[h] == hora) {
						reservaClicada = JSON.parse(JSON.stringify(r));
						break;
					}
				}
			}
		}

		// Campos a serem exibidos no dialog
		$scope.reserva.evento = reservaClicada.evento;
		$scope.reserva.descricao = reservaClicada.descricao;
		$scope.reserva.inicio = reservaClicada.horario[0];
		$scope.reserva.fim = reservaClicada.horario[reservaClicada.horario.length - 1] + 1;
		$scope.reserva.autor = reservaClicada.autor;

		// Exibição do dialog de informação de reserva
		$mdDialog.show({
			controller: InfoController,
			templateUrl: 'info-reserva.tpl.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
			.then(function () {

				var url = '/reservas/' + reservaClicada._id;

				// Requisição HTTP DELETE no ID da reserva para cancelar a reserva
				var request = $http({
					"method": "delete",
					"url": url,
				});
				request.then(function successCallback(response) {
					$scope.resultado = "Reserva cancelada com sucesso!";
					$window.location.reload(true);
				},
					function errorCallback(response) {
						console.log(response.data);
						if (response.status == 401) {
							$scope.mostraResposta("Não autorizado");
							//$scope.resposta = "Não autorizado";
							$window.location.href = '/login.html';
						}
						else if (response.status == 403) {
							$scope.mostraResposta("Não é permitido cancelar reservas de terceiros");
							//$scope.resposta = "Não é permitido cancelar reservas de terceiros";
						}
						else if (response.status == 404) {
							$scope.mostraResposta("Reserva não encontrada");
							//$scope.resposta = "Reserva não encontrada";
						}
						else {
							$scope.mostraResposta("Falha de acesso");
							//$scope.resposta = "Falha de acesso";
						}
					});

			}, function () {
				$scope.resposta = '';
				$scope.reserva.evento = '';
				$scope.reserva.descricao = '';
				$scope.reserva.inicio = 0;
				$scope.reserva.fim = 0;
				$scope.reserva.autor = '';
			});
	};

	$scope.mostraFormReserva = function (sala, hora, ev) {

		// Parâmetros iniciais para se reservar a sala
		$scope.reserva.inicio = hora;
		$scope.reserva.sala = $scope.salas[sala];
		$scope.reserva.dia = $scope.myDate.getDate() + '/' + ($scope.myDate.getMonth() + 1) + '/' + $scope.myDate.getFullYear();

		// Exibição do dialog de formulário de reserva
		$mdDialog.show({
			controller: FormController,
			templateUrl: 'form-reserva.tpl.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
			.then(function () {
				var data = JSON.stringify($scope.reserva);
				var url = '/reservas';

				// Requisição HTTP POST nas reservas para inserir a reserva
				var request = $http({
					"method": "post",
					"url": url,
					"data": data
				});
				request.then(function successCallback(response) {
					$scope.resultado = "Reserva efetuada com sucesso!";
					$window.location.reload(true);
				},
					function errorCallback(response) {
						console.log(response.data);
						if (response.status == 401) {
							$scope.mostraResposta("Não autorizado");
							//$scope.resposta = "Não autorizado";
							$window.location.href = '/login.html';
						}
						else if (response.status == 409) {
							$scope.mostraResposta("Horário já reservado");
							//$scope.resposta = "Horário já reservado";
						}
						else {
							$scope.mostraResposta("Falha de acesso");
							//$scope.resposta = "Falha de acesso";
						}
					});

			}, function () {
				$scope.resposta = '';
			});
	};

	// Controller interno do dialog de formulário de reserva
	function FormController(scope, $mdDialog) {
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

		scope.reservar = function () {

			// Confere se os campos estão todos preenchidos
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
				$mdDialog.hide();
			}
		};

		// Retorna um array iterável de begin até end (inclusivo) variando de step
		scope.range = function (begin, end, step) {
			var array = [];
			for (var i = begin; i <= end; i += step) {
				array.push(i);
			}
			return array;
		};
	}

	// Controller interno do dialog de informação de reserva
	function InfoController(scope, $mdDialog) {
		scope.evento = $scope.reserva.evento;
		scope.descricao = $scope.reserva.descricao;
		scope.inicio = $scope.reserva.inicio;
		scope.fim = $scope.reserva.fim;
		scope.autor = $scope.reserva.autor;

		scope.hide = function () {
			$mdDialog.hide();
		};

		scope.cancel = function () {
			$mdDialog.cancel();
		};

		scope.deletar = function () {
			$mdDialog.hide();
		};
	}
});

/*************	CONFIG RESPONSÁVEL PELO FORMATO DE EXIBIÇÃO DE DATA NO CALENDÁRIO	 *************/

ng_module.config(function ($mdDateLocaleProvider) {

	$mdDateLocaleProvider.formatDate = function (date) {
		return moment(date).format('DD/MM/YYYY');
	};

});

/*************	DIRETIVA RESPONSÁVEL PELA CONSTRUÇÃO DOS ELEMENTOS QUE COMPÕEM A TABELA	*************/

ng_module.directive('myTable', function ($window, $http) {
	return {
		restrict: 'A',
		templateUrl: 'tabela-reservas.tpl.html',
		link: function (scope, element, attributes) {

			var _salas = ['FE01', 'FE02', 'FE03', 'FE11', 'FE12', 'FE13'];

			// Construção das células da tabela
			var _celula = new Array(24);
			for (let i = 0; i < 24; i++) {
				_celula[i] = new Array(_salas.length).fill('');
			}

			// Retorna um array iterável de begin até end (inclusivo) variando de step
			function _range(begin, end, step) {
				var array = [];

				for (var i = begin; i <= end; i += step) {
					array.push(i);
				}
				return array;
			}

			// Preenche as células da tabela conforme as reservas do dia
			function _pegaReservasDia(diaStr) {
				var url = '/reservas';

				var config = {
					params: {
						dia: diaStr
					}
				};

				// Requisição HTTP GET nas reservas para ver as reservas do dia (DD/MM/YYYY)
				var request = $http.get(url, config);

				request.then(function successCallback(response) {
					scope.listaDeReservas = [...response.data];
					// Limpa as celulas
					for (let i = 0; i < 24; i++) {
						for (let j = 0; j < _salas.length; j++) {
							_celula[i][j] = "";
						}
					}

					// Preenche a celula com as reservas recebidas no response
					for (let r of scope.listaDeReservas) {
						let idxSala = _salas.indexOf(r.sala);
						for (let h = 0; h < r.horario.length; h++) {
							_celula[r.horario[h]][idxSala] = r.evento;

						}
					}
				},
					function errorCallback(response) {
						console.log(response.data);
						if (response.status == 401) {
							$scope.mostraResposta("Não autorizado");
							//scope.resposta = "Não autorizado";
							$window.location.href = '/login.html';
						}
						else {
							$scope.mostraResposta("Falha de acesso");
							//$scope.resposta = "Falha de acesso";
						}
						return;
					});
			}


			function _init() {
				// Torna essas variáveis visíveis no escopo do controller indexCtrl
				scope.range = _range;
				scope.salas = _salas;
				scope.celula = _celula;
				scope.pegaReservasDia = _pegaReservasDia;
				let diastr = scope.myDate.getDate() + '/' + (scope.myDate.getMonth() + 1) + '/' + scope.myDate.getFullYear();
				_pegaReservasDia(diastr);

			}
			_init();
		}
	};
});
