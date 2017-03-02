/*
 * data-access
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

/*
 * Module dependencies.
 */

const DEFAULT_CONNECTION_CONFIG = {
    connectionLimit : 10,
    host            : '198.71.225.61',
    user            : 'giftiadmin',
    password        : 'Bigorna!1',
    database        : 'swtgiftidb_dev'
};
const USER_CONNECTION_CONFIG = {
    connectionLimit : 10,
    host            : '198.71.225.61',
    user            : 'useradmin',
    password        : 'Bigorna!1',
    database        : 'swtuserdb_dev'
}; 
const LOG_CONNECTION_CONFIG = {
    connectionLimit : 10,
    host            : '198.71.225.61',
    user            : 'useradmin',
    password        : 'Bigorna!1',
    database        : 'swtuserdb_dev'
}; 

var database   = require('mysql');
var product    = require('./product');
var user       = require('./user');
var log        = require('./log');
// Connections
var connectionPool = database.createPool(DEFAULT_CONNECTION_CONFIG);
var userConnectionPool = database.createPool(USER_CONNECTION_CONFIG);
var logConnectionPool = database.createPool(LOG_CONNECTION_CONFIG);

module.exports = {
    user: user(userConnectionPool),
    product: product(connectionPool),
    log: log(logConnectionPool)
};