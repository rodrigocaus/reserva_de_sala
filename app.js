var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// adicione "ponteiro" para o MongoDB
var mongoReservas = require('./models/mongo_reservas');
var mongoUsuarios = require('./models/mongo_usuarios');

var app = express();

// serve static files
app.use('/', express.static(__dirname + '/'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": false }));
app.use(cookieParser());

var router = express.Router();
app.use('/', router);
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

// codigo abaixo adicionado para o processamento das requisições
// HTTP GET, POST, PUT, DELETE

//Verifica o cookie do usuario para fins de autenticação, retornando sua matricula e status de admin caso exista
function checkAuth(req, res) {
	cookies = req.cookies;
	if (!cookies || !cookies.userAuth) return 'unauthorized';
	var content = JSON.parse(cookies.userAuth);
	var key = content.key;
	var user = { "matricula": content.matricula, "admin": content.admin }
	if (key == 'secret') return user;
	return 'unauthorized';
}

// index.html
router.route('/')
	.get(function (req, res) {  // GET
		res.header('Cache-Control', 'no-cache');
		//Abre index.html se há autenticação. Se não estiver autenticado, redireciona para a pagina de login
		if (checkAuth(req, res) == 'unauthorized') {
			res.sendFile('public/login.html', { "root": "./" });
		}
		else {
			res.sendFile('public/index.html', { "root": "./" });
		}

	}
	);

router.route('/reservas')   // operacoes sobre todas as reservas
	.get(function (req, res) {  // GET
		//Verifica autenticacao
		var usuarioSolicitante = checkAuth(req, res);
		if (usuarioSolicitante == 'unauthorized') {
			res.status(401).send("Nao autorizado");
			return;
		}
		var query = { "dia": req.query.dia };

		mongoReservas.find(query, function (erro, data) {
			if (erro) res.status(500).send("Falha no servidor");
			else {
				res.status(200).send(data);
			}
		});

	}
	)
	.post(function (req, res) {   // POST (cria reserva)

		//Verifica autenticacao
		var usuarioSolicitante = checkAuth(req, res);
		if (usuarioSolicitante == 'unauthorized') {
			res.status(401).send("Nao autorizado");
			return;
		}

		var query = { "dia": req.body.dia, "sala": req.body.sala };

		//Vetor com todos os horarios em que o evento ocupa
		var horariosSelecionados = [];
		for (let i = req.body.inicio; i < req.body.fim; i++) {
			horariosSelecionados.push(i);
		}

		mongoReservas.find(query, function (erro, data) {
			if (erro) res.status(500).send("Falha no servidor");
			else {
				//Verifica conflito de horarios
				for (var reserva = 0; reserva < data.length; reserva++) {
					for (var hora = 0; hora < data[reserva].horario.length; hora++) {
						if (horariosSelecionados.includes(data[reserva].horario[hora]) === true) {
							res.status(409).send("Horario ja reservado");
							return;
						}
					}
				}

				//Adiciona a reserva se nao deu conflito de horario
				var novaReserva = new mongoReservas();
				novaReserva.sala = req.body.sala;
				novaReserva.autor = usuarioSolicitante.matricula;
				novaReserva.dia = req.body.dia;
				novaReserva.evento = req.body.evento;
				novaReserva.descricao = req.body.descricao;
				novaReserva.horario = [...horariosSelecionados];
				novaReserva.save(function (erro) {
					if (erro) res.status(500).send("Erro ao efetuar reserva");
					else res.status(200).send("Reserva inserida");
				});

			}
		});
	}
	);



router.route('/reservas/:id')   // operacoes sobre uma reserva (ID)
	.put(function (req, res) {   // PUT (altera reserva)

		//Verifica autenticacao
		var usuarioSolicitante = checkAuth(req, res);
		if (usuarioSolicitante == 'unauthorized') {
			res.status(401).send("Nao autorizado");
			return;
		}

		var query = { "_id": req.params.id };
		var alteracao = {
			$set: {
				"evento": req.body.evento,
				"descricao": req.body.descricao
			}
		}

		mongoReservas.findOne(query, function (erro, data) {
			if (erro) res.status(500).send("Falha no servidor");
			else if (data == null) res.status(404).send("Nao encontrado");
			//Precisa ser autor para alterar reservas
			else if (data.autor !== usuarioSolicitante.matricula) res.status(403).send("Nao autorizado");
			else {
				mongoReservas.findOneAndUpdate(query, alteracao, function (erro2, data2) {
					if (erro2) res.status(500).send("Falha no servidor");
					else if (data2 == null) res.status(404).send("Nao encontrado");
					else res.status(200).send("Alterado com sucesso");
				});
			}
		});
	}
	)
	.delete(function (req, res) {   // DELETE (remove reserva)

		//Verifica autenticacao
		var usuarioSolicitante = checkAuth(req, res);
		if (usuarioSolicitante == 'unauthorized') {
			res.status(401).send("Nao autorizado");
			return;
		}

		var query = { "_id": req.params.id };
		mongoReservas.findOne(query, function (erro, data) {
			if (erro) res.status(500).send("Falha no servidor");
			else if (data == null) res.status(404).send("Nao encontrado");
			//Precisa de status de admin para deletar reservas de terceiros
			else if (data.autor !== usuarioSolicitante.matricula && usuarioSolicitante.admin == false) res.status(403).send("Nao autorizado");
			else {
				mongoReservas.deleteOne(query, function (erro) {
					if (erro) res.status(500).send("Falha no servidor");
					else res.status(200).send("Removido com sucesso");
				});
			}
		});
	}
	);


router.route('/login')   // autenticação
	.get(function (req, res) {  //Exibe pagina de login
		res.header('Cache-Control', 'no-cache');
		res.sendFile('public/login.html', { "root": "./" });
	}
	)
	.post(function (req, res) { // Login
		var query = { "matricula": req.body.matricula, "senha": req.body.senha };
		mongoUsuarios.findOne(query, function (erro, data) {
			if (erro) res.status(500).send("Falha no servidor");
			else if (data == null) res.status(401).send("Falha no login");
			else {
				cookieContent = { "key": "secret", "matricula": data.matricula, "admin": data.admin };
				// Cookie expira em 10 minutos
				res.cookie('userAuth', JSON.stringify(cookieContent), { 'maxAge': 10 * 60 * 1000 });
				res.status(200).send("Login efetuado");
			}

		});
	}
	)
	.put(function (req, res) { // Cadastro
		var query = { "matricula": req.body.matricula };
		mongoUsuarios.findOne(query, function (erro, data) {
			if (erro) res.status(500).send("Falha no servidor");
			else if (data == null) {
				// Usuario novo
				var novoUsuario = new mongoUsuarios();
				novoUsuario.nome = req.body.nome;
				novoUsuario.matricula = req.body.matricula;
				novoUsuario.senha = req.body.senha;
				novoUsuario.admin = false;
				novoUsuario.save(function (erro) {
					if (erro) res.status(500).send("Erro ao registrar usuario");
					else res.status(200).send("Usuario inserido");
				});
			}
			else {
				res.status(409).send("Usuario ja cadastrado");
			}

		});
	}
	)
	.delete(function (req, res) { // Logout
		if (checkAuth(req, res) != 'unauthorized') {
			res.clearCookie('userAuth');
			res.status(200).send('Logout efetuado');
		}
		else {
			res.status(401).send('Nao autorizado');
			return;
		}
	}
	);
