# vcn

Dumb [quasy] secret manager.

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

## Documentation

```
vcn put -b goliatone.vecna.io --password Pa$sW07d --id envset --filepath .envset
```

```
vcn get -b goliatone.vecna.io --password Pa$sW07d --id envset --filepath .envset
```

## Examples
_(Coming soon)_

## TODO
* Use `.vcnrc`:
    * default bucket
    * default password
    * AWS credentials
* Review `aws-credentials` module, we had to revers order of loaders.
* Use AWS kms :)
* Figure out better name

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 goliatone  
Licensed under the MIT license.
