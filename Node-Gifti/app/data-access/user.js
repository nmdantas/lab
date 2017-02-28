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
        get: get,
        getAddress: getAddress,
        getDetails: getDetails,
        session: {
            exists: checkSession, 
            create: createSession,
            delete: deleteSession
        }
    };
}

/**
 * Select all product imports
 *
 * @return {UserEntity[]}
 * @public
 */
function get(req, res, next) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            next(poolError);

            return;
        }

        var username = req.body.username;
        var password = req.body.password;
        var keepAlive = req.body.keepAlive || false;
        var applicationId = req.body.applicationId;
        var query = 'SELECT	USER_ID, ' +
                    '       USER_EMAIL, ' +
                    '       USER_ROLE, ' +
                    '       MENU_ID, ' +
                    '       MENU_PATH, ' +
                    '       MENU_NAME, ' +
                    '       MENU_DESCRIPTION, ' +
                    '       MENU_PARENT_ID, ' +
                    '       MENU_DISPLAY_ORDER, ' +
                    '       MENU_ICON ' +
                    'FROM swtuserdb_dev.VIEW_USER_ACCESS ' +
                    'WHERE USER_EMAIL = ? ' +
                        'AND USER_PASSWORD = ? ' +
                        'AND APP_ID = ?'

        connection.query(query, [username, password, applicationId], function (error, results, fields) {
            connection.release();

            if (error) {
                next(error);
            } else {

                // Se nao houver retorno significa que o usuario não tem
                // permissão para acessar a aplicação
                if (results.length === 0) {
                    res.sendStatus(403);
                } else {
                    req.data = results;
                }

                next();
            }
        });
    });
}

function getAddress(userId, callback) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            next(poolError);

            return;
        }
        
        var query = 'SELECT	ZIPCODE, ' +
                    '       ADDRESS, ' +
                    '       DISTRICT, ' +
                    '       CITY, ' +
                    '       STATE, ' +
                    '       COUNTRY, ' +
                    '       STATUS, ' +
                    '       LATITUDE, ' +
                    '       LONGITUDE, ' +
                    '       NUMBER, ' +
                    '       COMPLEMENT ' +
                    'FROM swtuserdb_dev.USER_ADDRESS ' +
                    'WHERE USER_ID = ? ';

        connection.query(query, [userId], function (error, results, fields) {
            connection.release();

            if (error) {
                next(error);
            } else {

                // Verifica se encontrou os dados de endereço
                if (results.length === 1) {
                    callback(results[0]);
                } else {
                    callback({});
                }
            }
        });
    });
}

function getDetails(userId, callback) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            next(poolError);

            return;
        }
        
        var query = 'SELECT	NAME, ' +
                    '       BIRTHDAY, ' +
                    '       LASTNAME, ' +
                    '       NICKNAME, ' +
                    '       DOCUMENT ' +
                    'FROM swtuserdb_dev.USER_DATA ' +
                    'WHERE USER_ID = ? ';

        connection.query(query, [userId], function (error, results, fields) {
            connection.release();

            if (error) {
                next(error);
            } else {

                // Verifica se encontrou os dados
                if (results.length === 1) {
                    callback(results[0]);
                } else {
                    callback({});
                }
            }
        });
    });
}

function checkSession(req, res, next) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            next(poolError);

            return;
        }

        var username = req.body.username;
        var applicationId = req.body.applicationId;
        var query = 'SELECT	SESSION_KEY ' +
                    'FROM swtuserdb_dev.USER_SESSION ' +
                    'WHERE EMAIL = ? ' +
                        'AND APP_ID = ?'

        connection.query(query, [username, applicationId], function (error, results, fields) {
            connection.release();

            if (error) {
                next(error);
            } else {

                // Se nao houver retorno significa que o usuario não tem
                // permissão para acessar a aplicação
                if (results.length > 0) {
                    req.accessToken = results[0].SESSION_KEY;
                }

                next();
            }
        });
    });
}

function createSession(sessionInfo) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            next(poolError);

            return;
        }

        var command = ' INSERT INTO swtuserdb_dev.USER_SESSION SET ?'; // +
                      //' (USER_ID, SESSION_KEY, EMAIL, APP_ID) ' +
                      //' VALUES ?';// +
                      //' (79, 'chave', 'n.moraes.dantas@gmail.com', 5)'
        var args = {
            USER_ID: sessionInfo.user.id,             
            EMAIL: sessionInfo.user.email, 
            SESSION_KEY: sessionInfo.accessToken, 
            APP_ID: sessionInfo.application.id
        };

        connection.query(command, args, function(error, results, fields) {
            connection.release();

            // Pensar no tratamento de erro
        }); 
    });
}

function deleteSession(sessionInfo) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            next(poolError);

            return;
        }

        var command = ' DELETE FROM swtuserdb_dev.USER_SESSION WHERE USER_ID = ?';

        connection.query(command, [sessionInfo.user.id], function(error, results, fields) {
            connection.release();

            console.log('Delete Session: deleted ' + results.affectedRows + ' rows');
        }); 
    });    
}