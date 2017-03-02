/*
 * log-middleware
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

var dataAccess  = require('./../app/data-access');

function middleware() {
    return function(err, req, res, next) {
        console.log('[Error Middleware] Time: ', Date.now());

        res.status(500);
    
        res.json({
            errorCode: err.code,
            errorMessage: global.application.ERROR_CODES[err.code] || ''
        });
    }
}

module.exports = function() {
    var applicationId = 0;

    function saveDebug(message, source) {
        dataAccess.log.add({
            level: global.application.LOG_LEVEL.Debug,
            message: message,
            source: source,
            applicationId: applicationId
        });
    }

    function saveError(exception, source) {
        dataAccess.log.add({
            level: global.application.LOG_LEVEL.Exception,
            message: exception.message,
            source: source || '',
            stackTrace: exception.stack,
            applicationId: applicationId
        });
    }

    return {
        applicationId: function(appId) {
            applicationId = appId
        },
        saveDebug: saveDebug,
        saveError: saveError,
        middleware: middleware
    };
};
