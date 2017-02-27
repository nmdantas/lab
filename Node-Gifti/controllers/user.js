/*
 * user-controller
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

var TIMEOUT = 1000 * 60 * 20; // 20 minutos

var router      = require('express').Router();
var crypto      = require('crypto-js');
var dataAccess  = require('./../app/data-access');
var signature   = require('./../security/signature');
var authorize   = require('./../security/roles-authorization');

// A instancia de Gerenciador de Cache deve ser unico para todo o servidor
global.CacheManager = require("lru-cache")({
    max: 500,
    maxAge: 1000 * 600 /* Tempo Default no Cache Atual */,
    dispose: function onItemDropped(key, value) {
        // Callback para excluir sessao do banco de dados
        console.log('Dispose Item From Cache: ');
        console.log('key: ' + key);

        // No framework atual o registro não é apagado do banco
        // Se nao houver esta propriedade deve apagar a sessao no banco
        // Logo apos ja a apaga para que nao seja devolvido no response
        if (!value.update) {            
            dataAccess.user.session.delete(value);
        }

        delete value.update;
    }
});

// Middleware especifico para esta rota (Router)
router.use(function (req, res, next) {
  console.log('[User Router] Time: ', Date.now());

  next();
});

router.post('/login', checkSession, getUserAccess, formatResponse, createAccessToken);

function checkSession(req, res, next) {
    // Este metodo do data-access deve chamar o next
    dataAccess.user.session.exists(req, res, next);
}

function getUserAccess(req, res, next) {
    // Caso possua esta propriedade na requisicao significa que ja existe sessao    
    if (req.accessToken && global.CacheManager.has(req.accessToken)) {
        console.log('Get User Access From Cache');
        var sessionInfo = global.CacheManager.get(req.accessToken);
        sessionInfo.update = true;

        // Atualiza o Cache
        global.CacheManager.set(req.accessToken, sessionInfo, TIMEOUT);

        console.log("[Cache Length]: " + global.CacheManager.length);

        res.json(sessionInfo);
        // Esse return garante que nenhum dos demais Middlewares serao chamados
        return;
    }

    console.log('Get User Access From Database');
    // Este metodo do data-access deve chamar o next
    dataAccess.user.get(req, res, next);
}

function formatResponse(req, res, next) {
    var results = res.content;
    var formattedResponse = {
        user: {},
        roles: [],
        access: [],
        application: {
            id: req.body.applicationId
        }
    };

    // Se chegou ate esse ponto, ao menos uma linha existe nos resultados
    // Caso contrario seria resultado 403
    formattedResponse.user.id = results[0].USER_ID;
    formattedResponse.user.email = results[0].USER_EMAIL;

    for (var i = 0; i < results.length; i++) {
        // Roles de Acesso
        if (formattedResponse.roles.indexOf(results[i].USER_ROLE) === -1) {
            formattedResponse.roles.push(results[i].USER_ROLE);
        }

        // Menus de Acesso
        // Apenas adiciona os menus que não possuem sub-menus
        // Os sub-menus serao adicionados na expressao 'where' na property 'children'
        if (results[i].MENU_PARENT_ID === null) {
            var subMenus = []; //results.where({ MENU_PARENT_ID: results[i].MENU_ID });

            for (var j = 0; j < results.length; j++) {
                if (results[j].MENU_PARENT_ID === results[i].MENU_ID) {
                    subMenus.push({
                        id: results[j].MENU_ID,
                        path: results[j].MENU_PATH,
                        name: results[j].MENU_NAME,
                        description: results[j].MENU_DESCRIPTION,
                        parentId: results[j].MENU_PARENT_ID,
                        displayOrder: results[j].MENU_DISPLAY_ORDER,
                        icon: results[j].MENU_ICON,
                        children: []        
                    })
                }
            }
            
            formattedResponse.access.push({
                id: results[i].MENU_ID,
                path: results[i].MENU_PATH,
                name: results[i].MENU_NAME,
                description: results[i].MENU_DESCRIPTION,
                parentId: results[i].MENU_PARENT_ID,
                displayOrder: results[i].MENU_DISPLAY_ORDER,
                icon: results[i].MENU_ICON,
                children: subMenus
            });
        }
    }

    res.content = formattedResponse;

    next();
}

function createAccessToken(req, res, next) {
    var accessToken = signature(req.body.username);
    res.content.accessToken = accessToken;

    global.CacheManager.set(accessToken, res.content, TIMEOUT);

    dataAccess.user.session.delete(res.content);
    dataAccess.user.session.create(res.content);

    next();
}

module.exports = router;