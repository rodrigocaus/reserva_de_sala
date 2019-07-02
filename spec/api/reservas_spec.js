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

	it('testa efetuar a reserva com sucesso', function (t1) {
		frisby.post('http://localhost:3000/reservas', {
			sala: "FE03",
			autor: "158445",
			dia: "4/7/2019",
			evento: "Aula teste",
			descricao: "Aula para testar",
			inicio: 8,
			fim: 10
		})
			.expect('status', 200)
			.expect('bodyContains', 'Reserva inserida')
			.done(t1);
	});

	it('testa efetuar a reserva com conflito', function (t2) {
		frisby.post('http://localhost:3000/reservas', {
			sala: "FE03",
			autor: "158445",
			dia: "4/7/2019",
			evento: "Workshop teste",
			descricao: "Workshop para testar",
			inicio: 8,
			fim: 12
		})
			.expect('status', 409)
			.expect('bodyContains', 'Horario ja reservado')
			.done(t2);
	});

	//id para esse teste eh necessario ser obtido manualmente
	it('testa cancelar a propria reserva com sucesso', function (t3) {
		frisby.delete('http://localhost:3000/reservas/5d1a82e4f9657b032ab5bfaa')
			.expect('status', 200)
			.expect('bodyContains', 'Removido com sucesso')
			.done(t3);
    });
    
    it('testa cancelar reserva não existente', function (t4) {
		frisby.delete('http://localhost:3000/reservas/5d15307890c452998f260b12')
			.expect('status', 404)
			.expect('bodyContains', 'Nao encontrado')
			.done(t4);
    });

    it('testa alterar a reserva com sucesso', function (t5) {
		frisby.put('http://localhost:3000/reservas/5d1ac762faf44603f7fb2312', {
			evento: "Testando Aula",
            descricao: "Aula 2",
            inicio: 20,
            fim: 22
		})
			.expect('status', 200)
			.expect('bodyContains', 'Alterado com sucesso')
			.done(t5);
    });
    
    it('testa alterar uma reserva inexistente', function (t6) {
		frisby.put('http://localhost:3000/reservas/5d1ac762faf44603f7fb2412', {
			evento: "Teste aula",
            descricao: "Aula 3",
            inicio: 20,
            fim: 22
		})
			.expect('status', 404)
			.expect('bodyContains', 'Nao encontrado')
			.done(t6);
	});
});