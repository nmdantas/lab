/*
 * Gifti Server
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

// Este modulo nao possui retorno, ele é chamado apenas para carregar os
// metodos de extensao do tipo primitivo Array
require('./common/linq');
require('./common/constants');

var PORT = process.env.PORT || 1337;

var express     = require('express');
var bodyParser  = require('body-parser');
var compression = require('compression');
var log         = require('./services/log')();
var userRouter  = require('./controllers/user');
//var userSocket  = require('./controllers/user-socket')('/socket/v0/user');

var app = express();
app.use('/public', express.static(__dirname + '/public'));

// Entender como funciona esta linha
//app.use(bodyParser.urlencoded({ extended : true })); 
app.use(bodyParser.json());

// Middleware para compactar Responses
app.use(compression());

// Antes de qualquer requisicao passa por aqui
// Independente da rota '/*'
app.all('/*', function (req, res, next) {
    console.log('[First Middleware] Time: ', new Date().toString());

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, Content-Type, Accept, X-Requested-With, Accept-Encoding');

    next();
});

// Registra as rotas
// Todas as rotas devem ser registradas entre o primeiro Middleware e o ultimo
app.use('/api/v0/user', userRouter);

// Ultimo Middleware
// Usado como formatador
// Pode ser um jeito de evitar usar um formatador
// So formatar para camelcase
app.use(function (req, res, next) {
    console.log('[Last Middleware] Time: ', new Date().toString());

    //if (req.data) {
        // Nao esta pegando a versao do NPM.
        // Esta pegando a versao do meu github que contem alguns ajustes. Para tratar strings como "LOREM_IPSUM" para loremIpsum
    //    res.json(camelize(req.data));
    //}

    next();
});

// Middleware de erro
app.use(log.middleware());
// app.use(function(err, req, res, next) {  
//     console.log('[Error Middleware] Time: ', Date.now());
//     console.log(err);

//     res.status(500);
    
//     res.json({
//         message: 'Alguma coisa deu errada!'
//     });
// });

app.get('/', function(req, res) {
    res.json({
        api: 'swt',
        version: 'v0.0.3'
    });
});
app.listen(PORT);
console.log('Server Started...');

process.on('uncaughtException', (err) => {
    console.log('[Erro Geral]');
    console.log(err);
});