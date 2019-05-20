var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// adicione "ponteiro" para o MongoDB
var mongoOp = require('./models/mongo_reservas');
var mongoOp2 = require('./models/mongo_usuarios');

// comente as duas linhas abaixo
// var index = require('./routes/index');
// var users = require('./routes/users');

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
  var user = {"matricula": content.matricula, "admin": content.admin}
  if (key == 'secret') return user;
  return 'unauthorized';
}

// index.html
router.route('/')
  .get(function (req, res) {  // GET
    res.header('Cache-Control', 'no-cache');
    if ( checkAuth(req, res) == 'unauthorized' ) {
      res.sendFile('public/login.html', { "root": "./" });
    }
    else {
      res.sendFile('public/index.html', { "root": "./" });
    }
    
  }
  );

router.route('/reservas')   // operacoes sobre todos os alunos
  .get(function (req, res) {  // GET
    
  }
  )
  .post(function (req, res) {   // POST (cria)

  }
  );



router.route('/reservas/:id')   // operacoes sobre um aluno (RA)
  .get(function (req, res) {   // GET
    
  }
  )
  .put(function (req, res) {   // PUT (altera)
    
  }
  )
  .delete(function (req, res) {   // DELETE (remove)
    
  }
  );


router.route('/login')   // autenticação
  .get(function (req, res) {  //Exibe pagina de login
    res.header('Cache-Control', 'no-cache');
    res.sendFile('public/login.html', { "root": "./" });
  }
  )
  .post(function (req, res) { //Login
    // TODO: Pegar do mongo
    if (req.body.matricula == '123456' && req.body.senha == 'foo') {
      data = {"matricula": "123456", "admin": false };

      cookieContent = {"key": "secret", "matricula": data.matricula, "admin": data.admin};
      // Cookie expira em 10 minutos
      res.cookie('userAuth', JSON.stringify(cookieContent), {'maxAge': 10*60*1000});
      res.status(200).send("Login efetuado");
    }
    else {
      res.status(401).send("Falha no login");
    }
    
  }
  )
  .delete(function (req, res) {
    if(checkAuth(req, res) != 'unauthorized') {
      res.clearCookie('userAuth');
      res.status(200).send('Logout efetuado');
    }
    else {
      res.status(401).send('Nao autorizado');
      return;
    }
  }
  );

router.route('/cadastro')
  .get(function (req, res) {
    res.header('Cache-Control', 'no-cache');
    res.sendFile('public/cadastro.html', { "root": "./" });
  }
  )
  .post(function (req, res) {

  }
  );