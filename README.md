# Sistema de reserva de sala

Esta aplicação consiste em um sistema de reservas de salas do prédio da Faculdade de
Engenharia Elétrica (FEEC) da Unicamp.

Este projeto é uma aplicação distribuida com estilo de arquitetura 3-Tier 
(Cliente, Servidor e Banco de Dados) baseada em REST/HTTP e implementada em JavaScript 
com a framework MEAN (MongoDB, Express, AngularJS, NodeJS).

## Estrutura de Arquivos

Os arquivos estão separados conforme a arquitetura 3-tier:

- Cliente:	todo código executado na camada do cliente (navegador) está
		na pasta *public*. Em especial, o código JS está em *public/javascripts/angular-module.js*
- Servidor: essencialmente estruturado em *app.js* conforme padrão do *express generator*
- Banco de Dados: modelos de JS Object dos registros das reservas e dos usuários conforme os
 esquemas do *MongoDB/mongoose* em *models*


## Requisitos para executar a aplicação

Os requisitos estão especificados conforme *package.json*. Recomenda-se a instalação do NodeJS (versão 10
mínima) com npm 6.9 (mínimo) e os pacotes:
 - Express
 - Mongoose
 - Serve Favicon
 - Jasmine (para testes)
 - Frisby (para testes)

É importante ter o MongoDB instalado (mínima versão: 3.6) e executando como um serviço:

	# service mongodb start

## Executando a aplicação

Para executar, use o npm:

	$ npm install
	$ npm start

vá até o seu navegador de preferência e navegue para *http://localhost:3000/*

## Testando a aplicação

Os scripts de teste	são armazenados no diretório *spec/api*. Execute:

	$ jasmine-node spec/api

ou então

	$ npm test


