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

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": false }));
app.use(cookieParser());

// adicione as duas linhas abaixo
var router = express.Router();
app.use('/', router);   // deve vir depois de app.use(bodyParser...
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

function checkAuth(req, res) {
	cookies = req.cookies;
	if (!cookies || !cookies.userAuth) return 'unauthorized';
	var content = JSON.parse(cookies.userAuth);
	// console cookie info
	console.log(JSON.stringify(content));

	var key = content.key;
	var user = { "matricula": content.matricula, "admin": content.admin }
	if (key == 'secret') return user;
	return 'unauthorized';
}

// index.html
router.route('/')
	.get(function (req, res) {  // GET
		res.header('Cache-Control', 'no-cache');
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
		
	}
	)
	.post(function (req, res) {   // POST (cria)

	}
	);



router.route('/reservas/:id')   // operacoes sobre uma reserva (ID)
	.get(function (req, res) {   // GET

	}
	)
	.put(function (req, res) {   // PUT (altera reserva)

	}
	)
	.delete(function (req, res) {   // DELETE (remove reserva)

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
