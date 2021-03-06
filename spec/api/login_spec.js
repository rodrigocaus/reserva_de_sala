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

	it('testa o cadastro de aluno', function (t1) {
		frisby.put('http://localhost:3000/login', {
			nome: "Thales",
			matricula: "158445",
			senha: "123",
			senhaconfirma: "123"
		})
			.expect('status', 200)
			.expect('bodyContains', 'Usuario inserido')
			.done(t1);
	});

	it('testa login', function (t2) {
		frisby.post('http://localhost:3000/login', {
			matricula: "158445",
			senha: '123'
		})
			.expect('status', 200)
			.expect('header', 'Set-Cookie', new RegExp('[userAuth].*'))
			.expect('bodyContains', 'Login efetuado')
			.done(t2);
	});


	it('testa login falho', function (t3) {
		frisby.post('http://localhost:3000/login', {
			matricula: "158445",
			senha: '153'
		})
			.expect('status', 401)
			.expect('bodyContains', 'Falha no login')
			.done(t3);
	});

	it('testa o cadastro de aluno repetido', function (t4) {
		frisby.put('http://localhost:3000/login', {
			nome: "Thales",
			matricula: "158445",
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