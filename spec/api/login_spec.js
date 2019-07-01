var frisby = require('frisby');

// envia cookie de autenticacao
frisby.globalSetup({
	request: {
		headers: {
			'Cookie': 'userAuth={"key": "secret", "matricula": "matricula", "admin": false}',
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
			nome: "Thales",
			matricula: "741845",
			senha: "753951",
			senhaconfirma: "753951"
		})
			.expect('status', 200)
			.expect('bodyContains', 'Usuario inserido')
			.done(t3);
	});


	it('testa a cadastro de aluno repetido', function (t4) {
		frisby.put('http://localhost:3000/login', {
			nome: "Thales",
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
});