/*
 * Linq Adaptation For JavaScript
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

// Solucao temporaria, não é ideal modificar o prototype de um tipo 'primitivo'
Array.prototype.select = function (map) {
    var results = [];

    // Percorre todas as chaves passadas na pesquisa e as procurara dentro da coleção
    for (var i = 0; i < this.length; i++) {
        var match = true;
        var element = this[i];
        var newObject = {};

        for (var key in map) {
            if (typeof map[key] === 'string') {
                newObject[key] = element[map[key]];
            } else {
                newObject[key] = map[key];
            }
        }

        results.push(newObject);
    }
    
    return results;
}

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
