/*
 * log data-access
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
        add: add
    };
}

function add(logInfo) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            //next(poolError);

            return;
        }
        
        var command = ' INSERT INTO swtmonitordb_dev.LOG SET ?';
        var args = {
            LEVEL : logInfo.level,
            MESSAGE : logInfo.message,
            SOURCE : logInfo.source,
            STACKTRACE : logInfo.stackTrace,
            INNEREXCEPTION : logInfo.innerException,
            REGISTERDATE : new Date(),
            LOGARGS : logInfo.args,
            APP_ID : logInfo.applicationId
        };

        connection.query(command, args, function (error, results, fields) {
            connection.release();

            if (error) {
                //next(error);
                console.log('Erro Insert Log');
                console.log(error);
            } else {
                console.log('Insert Log Success');
            }
        });
    });
}
