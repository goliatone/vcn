/*
 * Vecna
 * https://github.com/eburgos/Vecna
 *
 * Copyright (c) 2015 goliatone
 * Licensed under the MIT license.
 */

'use strict';

var debug = require('debug')('vcn');
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
    //bucket needs to be unique across users/orgs
    bucket: 'goliatone.vecna.io',
    extension: 'vcn'
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
        targetpath = project + '/' + id + '.' + this.extension;

    var self = this;

    return fs.readFileAsync(filepath, 'utf8').then(function(content){
        debug('content', content);

        var VO = {
            content: content,
            path: filepath,
        };

        content = JSON.stringify(VO);

        var cypher = self.encrypt(content, password);

        var tmpfile = tmp.fileSync();
        debug('tmpfile', tmpfile.name);
        debug('content', cypher);
        return fs.writeFileAsync(tmpfile.name, cypher, 'utf8').then(function(){
            awscreds.knoxAsync(self.bucket).then(function(client){
                client = Promise.promisifyAll(client);
                debug('= here', targetpath);
                return client.putFileAsync(tmpfile.name, targetpath).then(function(res){
                    debug('DONE', res);
                    res.resume();
                }).catch(function(e){
                    debug('ERROR 2', e);
                    return e;
                });
            }).catch(function(e){
                debug('ERROR', e);
                return e;
            });
        }).catch(function(e){
            debug('ERRR 0', e);
            return e;
        });
    });
};

Vecna.prototype.get = function(filepath, password){
    var project = 'testing',
        id = 'package',
        targetpath = project + '/' + id + '.' + this.extension;

    var self = this;

    return awscreds.knoxAsync(self.bucket).then(function(client){
        client = Promise.promisifyAll(client);

        return client.getFileAsync(targetpath).then(function(res){

            return new Promise(function(resolve, reject){
                if(res.statusCode > 400){
                    return reject(new Error('Failed request: StatusCode ' + res.statusCode));
                }

                res.setEncoding('utf8');
                var data = '';

                res.on('data', function(chunk){
                    data += chunk;
                });

                res.on('end', function(){
                    data = self.decrypt(data, password);
                    debug('data');
                    resolve(data);
                });

                res.on('error', function(err){
                    reject(err);
                })
            });
        }).catch(function(e){
            console.log('ERROR 2', e);
        });
    }).catch(function(e){
        console.log('ERROR', e);
    });
};


Vecna.prototype.encrypt = function(content, password){
    var cipher = crypto.createCipher( this.algorithm, password);
    var crypted = cipher.update(content,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
};

Vecna.prototype.decrypt = function(content, password){
    var decipher = crypto.createDecipher( this.algorithm, password);
    var dec = decipher.update(content, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

Vecna.prototype.logger = console;

/**
 * Exports module
 */
module.exports = Vecna;

Vecna.exec = function(command, options){
    if(!command.match(/put|get/)) throw new Error('Command not supported');

    var vcn = new Vecna({
        bucket: options.bucket
    });

    switch (command) {
        case 'put':
            vcn.put(options.filepath, options.password).then(function(c){
                console.log('DONE', JSON.parse(JSON.parse(c).content));
            });
        break;
        case 'get':
        vcn.get(options.id, options.password).then(function(c){
            console.log( JSON.parse(JSON.parse(c).content));
        });
        break;
    }
};
/*
var test = new Vecna({
    bucket: 'goliatone.vecna.io'
});
// test.put('/Users/goliatone/Development/NODEJS/vecna/package.json', 'peperone').then(function(){
//     console.log('DONE');
// });
//
test.get('package', 'peperone').then(function(c){
    console.log('DONE', JSON.parse(JSON.parse(c).content));
});
*/
