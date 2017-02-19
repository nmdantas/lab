/*
 * data-access
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

var connection = null;

exports = module.exports = initialize;

/**
 * Expose 'initialize()'.
 */
function initialize(conn) {
    connection = conn;

    return {
        get: get
    };
}

/**
 * Select all product imports
 *
 * @return {UserEntity[]}
 * @public
 */
function get(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var keepAlive = req.body.keepAlive || false;
    var applicationId = req.body.applicationId;

    connection.query('SELECT * FROM USER WHERE EMAIL = ? AND TOKEN = ?', [username, password], function (error, results, fields) {
        if (error) {
            next(error);
        } else {

            if (results.length === 1) {
                res.content = results[0];
            } else {
                res.content = {};
            }

            next();
        }
    });
}
