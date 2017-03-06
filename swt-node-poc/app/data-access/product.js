/*
 * data-access
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

var connectionPool = null;

exports = module.exports = initialize;

/**
 * Expose 'initialize()'.
 */
function initialize(pool) {
    if (connectionPool == null)
        connectionPool = pool;

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
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            next(poolError);

            return;
        }

        connection.query('SELECT * FROM IMPORTACAO_SINTETICA', function (error, results, fields) {
            connection.release();

            if (error) {
                next(error);
            } else {
                res.content = results;

                next();
            }
        });
    });
}
