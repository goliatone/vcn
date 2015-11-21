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
var tildify = require('tildify');
var untildify = require('untildify');
var crypto = require('crypto');
var fs = Promise.promisifyAll(require('fs'));
var tmp = require('tmp');
var awscreds = require('./get-aws-credentials');
var Spinner = require('./spinner');

var DEFAULTS = {
    autoinitialize: true,
    algorithm: 'aes-256-ctr',
    //bucket needs to be unique across users/orgs
    bucket: 'goliatone.vecna.io',
    groupId: 'secrets',
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
};

Vecna.prototype.put = function(id, password, filepath) {
    var targetpath = this.getPath(id);

    var self = this;

    return fs.readFileAsync(filepath, 'utf8').then(function(content){
        debug('content', content);

        var VO = {
            content: content,
            path: tildify(filepath),
        };

        content = JSON.stringify(VO);

        var cypher = self.encrypt(content, password);

        var tmpfile = tmp.fileSync();
        debug('tmpfile', tmpfile.name);
        debug('content', cypher);
        return fs.writeFileAsync(tmpfile.name, cypher, 'utf8').then(function(){
            return awscreds.knox(self.bucket).then(function(client){
                debug('= here', targetpath);
                return client.putFileAsync(tmpfile.name, targetpath).then(function(res){
                    // debug('DONE', res);
                    res.resume();
                }).catch(function(e){
                    console.error('ERROR putFileAsync', e);
                    return e;
                });
            }).catch(function(e){
                //TODO: Make sure we get an error code from credential finder
                console.error('AWS credentials not found:');
                console.error('Ensure you have one of the following:');
                console.error('A valid ini file in ~/.aws/credentials with a default profile');
                console.error('A valid ini file in ~/.aws/config with a default profile');
                console.error('If you want to use a different profile set AMAZON_PROFILE env');
                console.error('');
                console.error('If you are using env vars:');
                console.error('AWS_ACCESS_KEY_ID, AMAZON_ACCESS_KEY_ID, AWS_ACCESS_KEY');
                console.error('AWS_SECRET_ACCESS_KEY, AMAZON_SECRET_ACCESS_KEY, AWS_SECRET_KEY');
                console.error('AWS_SESSION_TOKEN, AMAZON_SESSION_TOKEN');
                console.error('AWS_REGION, AMAZON_REGION, AWS_DEFAULT_REGION');
                console.error('');
                console.error('You can also load credentials form EC2 metadata');
                console.error('');
                debug(e);
                return e;
            });
        }).catch(function(e){
            console.error('ERRR fsWriteAsync', e);
            return e;
        });
    });
};

Vecna.prototype.get = function(id, password, filepath){
    var targetpath = this.getPath(id);

    var self = this;

    return awscreds.knox(self.bucket).then(function(client){
        return client.getFileAsync(targetpath).then(function(res){

            return new Promise(function(resolve, reject){
                //TODO: Handle all the non OK status codes!
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

                    var VO = JSON.parse(data);
                    VO.path = untildify(VO.path || '');

                    fs.writeFileAsync(filepath, VO.content).then(function(){
                        resolve(VO.content);
                    }).catch(function(e){
                        reject(e);
                    });
                });

                res.on('error', function(err){
                    reject(err);
                });
            });
        }).catch(function(e){
            console.log('ERROR 2', e);
        });
    }).catch(function(e){
        console.log('ERROR', e);
    });
};

Vecna.prototype.list = function(id, password){
    var self = this;

    return awscreds.knox(self.bucket).then(function(client){
        return client.listAsync({ prefix: self.groupId }).then(function(data){
            return data.Contents;
        });
    });
};

Vecna.prototype.del = function(id, password){
    //TODO: do we need a way to secure deletes? or simply by having
    //aws credentials to access the bucket we are cleared?
    var targetpath =  '/' + this.getPath(id);

    return awscreds.knox(this.bucket).then(function(client){
        return client.deleteFileAsync(targetpath).then(function(res){
            //TODO: Handle all the non OK status codes!
            if(res.statusCode === 204) {
                console.log(Object.keys(res));
                console.log(res.req.url, res.statusMessage)
                return Promise.reject(new Error('File "'+ targetpath + '" not found. ' + res.statusMessage));
            }

            console.log(res.statusCode);
            console.log('File %s deleted' , targetpath);
            res.resume();
        }).catch(function(err){
            console.error(err);
        });
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

Vecna.prototype.getPath = function(id){
    return this.groupId + '/' + id + '.' + this.extension;
};

Vecna.prototype.logger = console;

/**
 * Exports module
 */
module.exports = Vecna;

Vecna.exec = function(command, options){
    if(!command.match(/put|get|del|list/)) Promise.reject(new Error('Command not supported'));

    var config = extract(options, Object.keys(Vecna.DEFAULTS));
    var vcn = new Vecna(config);

    var promise,
        spinner = new Spinner();

    switch (command) {
        case 'put':
            promise = vcn.put(options.id, options.password, options.filepath);
        break;
        case 'get':
            promise = vcn.get(options.id, options.password, options.filepath);
        break;
        case 'del':
            promise = vcn.del(options.id, options.password);
        break;
        case 'list':
            promise = vcn.list(options.id, options.password);
        break;
    }

    promise.then(function(){
        spinner.stop();
    });

    return promise;
};


function extract(src, keys){
    return keys.reduce(function(out, key){
        if(src.hasOwnProperty(key)) out[key] = src[key];
        return out;
    }, {});
}
