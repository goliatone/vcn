'use strict';

var _Promise = require('bluebird'),
    awscred = require('awscred');

exports.knox = function(bucket) {
    var knox = require('knox');
    return new _Promise(function(resolve, reject){
        awscred.load(function(err, creds) {
            if(err) return reject(err);
            if(!creds || !creds.credentials) return reject(new Error('No credentials found'));
            var opts = {
                bucket: bucket,
                key: creds.credentials.accessKeyId,
                secret: creds.credentials.secretAccessKey
            };
            resolve(knox.createClient(opts));
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
