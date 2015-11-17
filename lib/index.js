/*
 * Vecna
 * https://github.com/eburgos/Vecna
 *
 * Copyright (c) 2015 goliatone
 * Licensed under the MIT license.
 */

'use strict';

var extend = require('gextend');
var _inherit = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var knox = Promise.promisifyAll(require('knox'));
var crypto = require('crypto');
var fs = Promise.promisifyAll(require('fs'));
var tmp = require('tmp');
var awscreds = Promise.promisifyAll(require('aws-credentials'));

var DEFAULTS = {
    autoinitialize: true,
    algorithm: 'aes-256-ctr',
    bucket: 'vecna.io'
};

function Vecna(config){
    EventEmitter.call(this);
    config = extend({}, this.constructor.DEFAULTS, config);

    if(config.autoinitialize ) this.init(config);
}

_inherit(Vecna, EventEmitter);

Vecna.DEFAULTS = DEFAULTS;

Vecna.prototype.init = function(config){
    if(this.initialized) return;
    this.initialized = true;

    extend(this, this.constructor.DEFAULTS, config);

    // this.client = knox.createClient({
    //     key: '<api-key-here>',
    //     secret: '<secret-here>',

    // });
};

Vecna.prototype.put = function(filepath, password) {

    var project = 'testing',
        id = 'package',
        targetpath = project + '/' + id;

    var self = this;

    return fs.readFileAsync(filepath, 'utf8').then(function(content){
        console.log('content', content);

        var VO = {
            content: content,
            path: filepath,
        };

        content = JSON.stringify(VO);

        var cypher = self.encrypt(content, password);

        var tmpfile = tmp.fileSync();
        console.log('tmpfile', tmpfile.name);

        return fs.writeFileAsync(tmpfile.name, cypher, 'utf8').then(function(){
            console.log('we are here');

            awscreds.knoxAsync(self.bucket).then(function(client){
                client = Promise.promisifyAll(client);
                console.log('here');
                return client.putFileAsync(tmpfile.name, targetpath).then(function(res){
                    console.log('DONE');
                    res.resume();
                }).catch(function(e){
                    console.log('ERROR 2', e);
                });
            }).catch(function(e){
                console.log('ERROR', e);
            });
        }).catch(function(e){
            console.log('ERRR 0', e);
        });
    });
};

Vecna.prototype.get = function(filepath, password){
    var project = 'testing',
        id = 'package',
        targetpath = project + '/' + id;

    return awscreds.knoxAsync(self.bucket).then(function(client){
        client = Promise.promisifyAll(client);
        console.log('here');
        return client.putFileAsync(tmpfile.name, targetpath).then(function(res){
            console.log('DONE');
            res.resume();
        }).catch(function(e){
            console.log('ERROR 2', e);
        });
    }).catch(function(e){
        console.log('ERROR', e);
    });

};


Vecna.prototype.encrypt = function(content, password){
    password = password || 'd6F3Efeq';
    var cipher = crypto.createCipher( this.algorithm, password);
    var crypted = cipher.update(content,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
};

Vecna.prototype.decrypt = function(content, password){
    var decipher = crypto.createDecipher( this.algorithm, password);
    var dec = decipher.update(content,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
};

Vecna.prototype.logger = console;

/**
 * Exports module
 */
module.exports = Vecna;


var test = new Vecna();
test.put('/Users/eburgos/Development/NODEJS/vecna/package.json', 'peperone').then(function(){
    console.log('FUCK');
});
