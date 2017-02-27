/*
 * signature
 * Copyright(c) 2017 Nicholas M. Dantas
 * MIT Licensed
 */

'use strict';

/*
 * Module dependencies.
 */

var crypto = require('crypto-js');

module.exports = generateToken;

/**
 * Expose 'generateToken(message: string): string'.
 */
function generateToken(message) {
    var key = (new Date()).toLocaleDateString() +
              generateTimeStamp() +
              generateNonce();

    return crypto.SHA1(message + key).toString();
}

function generateTimeStamp() {
    return (new Date().getSeconds() - new Date(1970, 0, 1).getSeconds()).toString();
}

function generateNonce() {
    return (Math.random() * (9999999 - 123400) + 123400).toString();
}