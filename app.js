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
app.use(express.static(path.join(__dirname, 'public')));

// adicione as duas linhas abaixo
var router = express.Router();
app.use('/', router);   // deve vir depois de app.use(bodyParser...

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
  cauth = cookies.userAuth;
  var content = JSON.parse(cauth);
  console.log(JSON.stringify(content));
  var key = content.key;
  var role = content.role;
  if (key == 'secret') return role
  return 'unauthorized';
}

// index.html
router.route('/')
  .get(function (req, res) {  // GET
    var path = 'index.html';
    res.header('Cache-Control', 'no-cache');
    res.sendFile(path, { "root": "./" });
  }
  );

router.route('/alunos')   // operacoes sobre todos os alunos
  .get(function (req, res) {  // GET
    
  }
  )
  .post(function (req, res) {   // POST (cria)

  }
  );



router.route('/alunos/:ra')   // operacoes sobre um aluno (RA)
  .get(function (req, res) {   // GET
    
  }
  )
  .put(function (req, res) {   // PUT (altera)
    
  }
  )
  .delete(function (req, res) {   // DELETE (remove)
    
  }
  );


router.route('/authentication')   // autenticação
  .get(function (req, res) {  // GET
    
  }
  )
  .post(function (req, res) {
    
  }
  )
  .delete(function (req, res) {
    
  }
  );

