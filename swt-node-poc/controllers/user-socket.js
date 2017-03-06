/*
 * user-socket
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

var TIMEOUT = 1000 * 60 * 20; // 20 minutos

var io  = require('socket.io')();
var da  = require('./../app/data-access');

/**
 * Expose 'initialize()'.
 */
function initialize(namespace) {    
    var nsp = namespace || '/';

    // Cria conexao apenas no namespace passado
    io.of(nsp).on('connection', function(socket) {
        console.log('[New Connection In Namespace]');
        console.log(socket.handshake.query.accessToken);

        var accessToken = socket.handshake.query.accessToken;

        if (accessToken) {
            sendAddress(accessToken, socket);            
            setTimeout(sendDetails, 5000, accessToken, socket);
            setTimeout(function() {
                socket.disconnect();
            }, 8000);
        }
    });

    // Inicia a comunicacao via socket
    io.listen(3000);
}

function sendAddress(accessToken, socket) {
    console.log('[Address Request]');
    console.log(accessToken);

    var callback = function(queryResult) {
        var addressInfo = {
            zipCode: queryResult.ZIPCODE,
            address: queryResult.ADDRESS,
            district: queryResult.DISTRICT,
            city: queryResult.CITY,
            state: queryResult.STATE,
            country: queryResult.COUNTRY,
            status: queryResult.STATUS,
            latitude: queryResult.LATITUDE,
            longitude: queryResult.LONGITUDE,
            number: queryResult.NUMBER,
            complement: queryResult.COMPLEMENT
        };

        console.log('[Emit Address]');
        socket.emit('addressReceived', addressInfo);
    };

    if (global.CacheManager.has(accessToken)) {
        da.user.getAddress(global.CacheManager.get(accessToken).user.id, callback);
    }
}

function sendDetails(accessToken, socket) {
    console.log('[Details Request]');
    console.log(accessToken);

    var callback = function(queryResult) {
        var detailsInfo = {
            name: queryResult.NAME,
            birthday: queryResult.BIRTHDAY,
            lastname: queryResult.LASTNAME,
            nickname: queryResult.NICKNAME,
            document: queryResult.DOCUMENT
        };

        console.log('[Emit Details]');
        socket.emit('detailsReceived', detailsInfo);
    };

    if (global.CacheManager.has(accessToken)) {
        da.user.getDetails(global.CacheManager.get(accessToken).user.id, callback);
    }
}

module.exports = initialize;
