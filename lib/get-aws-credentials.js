'use strict';

var Promise = require('bluebird'),
    debug = require('debug')('aws:credentials'),
    awscred = require('awscred');

exports.knox = function(bucket) {
    var knox = require('knox');
    return new Promise(function(resolve, reject){
        awscred.load(function(err, creds) {
            if(err) return reject(err);
            if(!creds || !creds.credentials) return reject(new Error('No credentials found'));

            var opts = {
                bucket: bucket,
                key: creds.credentials.accessKeyId,
                secret: creds.credentials.secretAccessKey
            };
            debug(opts);

            var client;
            try {
                client = knox.createClient(opts);
            } catch(e){
                return reject(e);
            }
            resolve(Promise.promisifyAll(client));
        });
    });
};

if (!module.parent) {
    awscred.load(function(err, creds){
        console.log(err || creds);
    });

    // awscred.knox('mybucket', function(err, creds){
    //   console.log(err || creds);
    // });
}
