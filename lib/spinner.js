var elegantSpinner = require('elegant-spinner');
var logUpdate = require('log-update');
var chalk = require('chalk');
function Spinner(){
    this.start()
}
Spinner.prototype.start = function(){

    var frame = elegantSpinner();

    this.interval = setInterval(function () {
        logUpdate(chalk.cyan(frame()));
    }, 50);
};

Spinner.prototype.stop = function(){
    clearInterval(this.interval);
    logUpdate.clear();
};

module.exports = Spinner;
