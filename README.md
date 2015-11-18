# vecna

Dumb [quasy] secret manager

## Getting Started
Install the module with: `npm install vecna`

```javascript
var vecna = require('vecna');
vecna.awesome(); // "awesome"
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
