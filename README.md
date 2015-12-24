# vcn

Dumb [quasi] secret manager. Intended to share configuration files between team members. It uses AWS S3 to store encrypted files.

**vecna**:
> The fictional character Vecna (/ˈvɛk nɑː/ vek-nah[1]) has been named as one of the greatest villains in the Dungeons & Dragons roleplaying game.


> He is primarily the god of secrets.

This is as secure as your AWS credential management policy :) It's in the roadmap to integrate AWS KMS.

## Getting Started

Install the module with: `npm install -g vcn`

You can use `vcn` through the CLI:

```
vcn put -b goliatone.vecna.io --password Pa$sW07d --id envset --filepath .envset
```

```
vcn get -b goliatone.vecna.io --password Pa$sW07d --id envset --filepath .envset
```

You can also use it programmatically.

To store a file:

```javascript
var Vcn = require('vcn');

var test = new Vcn({
    bucket: 'goliatone.vecna.io'
});

test.put('envset', 'Pa$sW07d' , '/Users/goliatone/Development/menagerie/.envset').then(function(){
     console.log('Put file success');
});
```


To retrieve the file:
```js
//
test.get('envset', 'Pa$sW07d').then(function(file){
    console.log('Get file success', file);
});

```

## Examples

```
vcn put -b goliatone.vecna.io --password Pa$sW07d --id envset --filepath .envset
```

```
vcn get -b goliatone.vecna.io --password Pa$sW07d --id envset --filepath .envset
```

## Documentation

_(Coming soon)_

### NOTE

Currently we are not managing multiple AWS credentials in one box and we use the default set. If you are not getting the expected results ensure that your default credentials are the ones you need.

## TODO
- Handle multiple AWS credentials in machine.
- Use `.vcnrc`:
    * default bucket
    * default password
    * AWS credentials
- ~~Review `aws-credentials` module, we had to revers order of loaders.~~
- Use AWS kms :)
- Figure out better name
- Add progress info
- Handle all the non OK status codes!
- Handle non existing buckets
- Handle wrong password? how do we know?

<!--
npm install --save progress

```js
var ProgressBar = require('progress');
var barOpts = {
   width: 20,
   total: fileSize,
   clear: true
};
var bar = new ProgressBar(' uploading [:bar] :percent :etas', barOpts);
var emitter = client.putFile...
emitter.on('progress', function(p){
    bar.tick(p.percent);
});
```

Require password with prompt:
```js
var prompt = require('co-prompt');
co(function *() {
      var username = yield prompt('username: ');
      var password = yield prompt.password('password: ');
       console.log('user: %s pass: %s file: %s',
          username, password, file);
});
-->

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 goliatone  
Licensed under the MIT license.
