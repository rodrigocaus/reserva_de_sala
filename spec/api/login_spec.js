var frisby = require('frisby');

// envia cookie de autenticacao
frisby.globalSetup({
	request: {
		headers: {
			'Cookie': 'userAuth={"key": "secret", "matricula": "matricula", "admin": "admin"}',
		}
	}
})

const Joi = frisby.Joi; // Frisby exposes Joi for convenience

describe('test suite', function () {

	it('testa login', function (t1) {
		frisby.post('http://localhost:3000/login', {
			matricula: "158445",
			senha: '123'
		})
			.expect('status', 200)
			.expect('header', 'Set-Cookie', new RegExp('[userAuth].*'))
			.expect('bodyContains', 'Login efetuado')
			.done(t1);
	});


	it('testa login falho', function (t2) {
		frisby.post('http://localhost:3000/login', {
			matricula: "158445",
			senha: '153'
		})
			.expect('status', 401)
			.expect('bodyContains', 'Falha no login')
			.done(t2);
	});


	it('testa a cadastro de aluno', function (t3) {
		frisby.put('http://localhost:3000/login', {
			nome: "ceara",
			matricula: "741844",
			senha: "753951",
			senhaconfirma: "753951"
		})
			.expect('status', 200)
			.expect('bodyContains', 'Usuario inserido')
			.done(t3);
	});


	it('testa a cadastro de aluno repetido', function (t4) {
		frisby.put('http://localhost:3000/login', {
			nome: "ceara",
			matricula: "741852",
			senha: "753951",
			senhaconfirma: "753951"
		})
			.expect('status', 409)
			.expect('bodyContains', 'Usuario ja cadastrado')
			.done(t4);
	});


	it('testa logout', function (t5) {
		frisby.delete('http://localhost:3000/login')
			.expect('status', 200)
			.expect('bodyContains', 'Logout efetuado')
			.done(t5);
	});

	/*
	it('testa o metodo get com RA', function(t6) {
	frisby.get('http://localhost:3000/alunos/555555')
	  .expect('status', 200)
	  .expect('header', 'Content-Type', new RegExp('[application/json].*'))
	  .expect('jsonTypes', {alunos: Joi.array().min(1).max(1).items({
				 ra: Joi.string().required(),
				 nome: Joi.string().required(),
				 curso: Joi.string().required()
				 })})
	  .done(t6);
	});
  
	it('testa o metodo put para alterar um aluno', function(t7) {
	frisby.put('http://localhost:3000/alunos/555555', {
	  ra: "555555",
	  nome: 'Isaac Newton',
	  curso: 'Engenharia'})
	 .expect('status', 200)
	 .expect('json', {resultado:"aluno atualizado"}) 
	 .done(t7);
	});
  
   it('testa o metodo delete para remover um aluno', function(t8) {
	frisby.delete('http://localhost:3000/alunos/555555')
	 .expect('status', 200)
	 .expect('json', {resultado:"aluno removido"}) 
	 .done(t8);
	});
  
   it('testa roteamento invalido', function(t9) {
	frisby.get('http://localhost:3000/alunos/555555/nome')
	 .expect('status', 404) 
	 .done(t9);
	});
  
   it('testa logout', function(t10) {
	frisby.delete('http://localhost:3000/authentication')
	 .expect('status', 200)
	 .expect('header', 'Set-Cookie', new RegExp('[userAuth].*'))
	 .expect('bodyContains', 'Sucesso') 
	 .done(t10);
	});
	*/
});