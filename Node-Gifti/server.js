/*
 * Gifti Server
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

// Solucao temporaria, não é ideal modificar o prototype de um tipo 'primitivo'
Array.prototype.where = function (predicate) {
    var results = [];

    // Percorre todas as chaves passadas na pesquisa e as procurara dentro da coleção
    for (var i = 0; i < this.length; i++) {
        var match = true;
        var element = this[i];
                
        for (var key in predicate) {
            match &= element[key] && element[key] === predicate[key];
        }

        // Caso tenha encontrado o elemento aborta o looping e retorna verdadeiro
        if (match) {
            results.push(element);
        }
    }
    
    return results;
}

Array.prototype.any = function (predicate) {
    // Caso o predicado passado for uma string utiliza a função nativa 'indexOf'
    if (typeof predicate === 'string' || typeof predicate === 'number') {
        return this.indexOf(predicate) > -1;
    }

    // Percorre todas as chaves passadas na pesquisa e as procurara dentro da coleção
    for (var i = 0; i < this.length; i++) {
        var match = true;
        var element = this[i];
                
        for (var key in predicate) {
            match &= element[key] && element[key] === predicate[key];
        }

        // Caso tenha encontrado o elemento aborta o looping e retorna verdadeiro
        if (match) {
            return true;
        }
    }
    
    return false;
}

var PORT = process.env.PORT || 1337;

var app         = require('express')();
var bodyParser  = require('body-parser');
var compression = require('compression');
var camelize    = require('camelize');
var userRouter  = require('./controllers/user');
var userSocket  = require('./controllers/user-socket')('/socket/v0/user');

// Entender como funciona esta linha
//app.use(bodyParser.urlencoded({ extended : true })); 
app.use(bodyParser.json());

// Middleware para compactar Responses
app.use(compression());

// Antes de qualquer requisicao passa por aqui
// Independente da rota '/*'
app.all('/*', function (req, res, next) {
    console.log('[First Middleware] Time: ', Date.now());

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
    console.log('[Last Middleware] Time: ', Date.now());

    if (res.content) {
        // Nao esta pegando a versao do NPM.
        // Esta pegando a versao do meu github que contem alguns ajustes. Para tratar strings como "LOREM_IPSUM" para loremIpsum
        res.json(camelize(res.content));
    }

    next();
});

// Middleware de erro
app.use(function(err, req, res, next) {  
    console.log('[Error Middleware] Time: ', Date.now());
    console.log(err);

    res.status(500);
    
    res.json({
        message: 'Alguma coisa deu errada!'
    });
});

app.listen(PORT);
console.log('Server Started...');

process.on('exit', function() {
    console.log('[Exit]');
});

process.on('beforeExit', function() {
    console.log('[Before Exit]');
});

process.on('disconnect', function() {
    console.log('[Disconnect]');
});
