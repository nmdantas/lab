/*
 * Gifti
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

var PORT = process.env.PORT || 1337;

var express    = require('express');
var bodyParser = require('body-parser');
var camelize   = require('camelize');
var dataAccess = require('./app/data-access');

var app = express();
// Entender como funciona esta linha
//app.use(bodyParser.urlencoded({ extended : true })); 
app.use(bodyParser.json());

// Antes de qualquer requisicao passa por aqui
// Independente da rota '/*'
app.all('/*', function (req, res, next) {
  next();
})

app.get('/api/products', function (req, res, next) {
    // Este metodo deve chamar o next
    dataAccess.product.selectAll(req, res, next);
});

app.post('/api/user/login', function (req, res, next) {
    // Este metodo deve chamar o next
    dataAccess.user.get(req, res, next);
}, function (req, res, next) {
    var signature = require('./app/security/signature');

    res.content.sessionKey = signature(req.body.username);

    next();
});

// Ultimo Middleware
// Usado como formatador
// Pode ser um jeito de evitar usar um formatador
// So formatar para camelcase
app.use(function (req, res, next) {
    if (res.content) {
        // Nao esta pegando a versao do NPM.
        // Esta pegando a versao do meu github que contem alguns ajustes. Para tratar strings como "LOREM_IPSUM" para loremIpsum
        res.json(camelize(res.content));
    }

    next();
});

// Middleware de erro
app.use(function(err, req, res, next) {  
    res.status(500);
    
    res.json({
        message: 'Something broke!'
    });
});

app.listen(PORT);
console.log('Server listening port ' + PORT);