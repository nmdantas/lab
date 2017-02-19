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
        selectAll: selectAll
    };
}

/**
 * Select all product imports
 *
 * @return {ProductEntity[]}
 * @public
 */
function selectAll(req, res, next) {
    connection.query('SELECT * FROM IMPORTACAO_SINTETICA', function (error, results, fields) {
        if (error) {
            next(error);
        } else {
            res.content = results;

            next();
        }
    });
}
