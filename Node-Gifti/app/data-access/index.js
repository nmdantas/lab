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
    host     : '198.71.225.61',
    user     : 'giftiadmin',
    password : 'Bigorna!1',
    database : 'swtgiftidb_dev'
};
const USER_CONNECTION_CONFIG = {
    host     : '198.71.225.61',
    user     : 'useradmin',
    password : 'Bigorna!1',
    database : 'swtuserdb_dev'
}; 

var database   = require('mysql');
var product    = require('./product');
var user       = require('./user');
// Connections
var connection = database.createConnection(DEFAULT_CONNECTION_CONFIG);
var userConnection = database.createConnection(USER_CONNECTION_CONFIG);

module.exports = {
    user: user(userConnection),
    product: product(connection)
};