// var elegantSpinner = require('elegant-spinner');
var logUpdate = require('log-update');
var chalk = require('chalk');

function Spinner(){
    this.start();
}

Spinner.Patterns = [
'0123456789',
'⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏',
'⠋⠙⠚⠞⠖⠦⠴⠲⠳⠓',
'⠄⠆⠇⠋⠙⠸⠰⠠⠰⠸⠙⠋⠇⠆',
'⠋⠙⠚⠒⠂⠂⠒⠲⠴⠦⠖⠒⠐⠐⠒⠓⠋',
'⠁⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠤⠴⠲⠒⠂⠂⠒⠚⠙⠉⠁',
'⠈⠉⠋⠓⠒⠐⠐⠒⠖⠦⠤⠠⠠⠤⠦⠖⠒⠐⠐⠒⠓⠋⠉⠈',
'⠁⠁⠉⠙⠚⠒⠂⠂⠒⠲⠴⠤⠄⠄⠤⠠⠠⠤⠦⠖⠒⠐⠐⠒⠓⠋⠉⠈⠈',
'|/-\\',
'◴◷◶◵',
'◰◳◲◱',
'◐◓◑◒',
'▉▊▋▌▍▎▏▎▍▌▋▊▉',
'▌▄▐▀',
'╫╪',
'■□▪▫',
'←↑→↓',
// 'basic'	: '|/—\\',
// 'circle-light' 	: ['◜ ',' ◝',' ◞','◟ '],
// 'circle-cross' 	: '⊕⊗',
// 'circle'		: '◐◓◑◒',
//
// 'square-light'	: ['⌜ ',' ⌝',' ⌟','⌞ '],
// 'square-corner' : '◢◣◤◥',
// 'square-line' 	: '▤▧▥▨',
//
// 'bar-v'	: '▁▂▃▄▅▆▇█▇▆▄▂▁',
// 'bar-h'	: '▏▎▍▌▋▋▊▋▌▍▎▏',
//
// 'triangle-bold' : '▲▶▼◀',
//
// 'arrow-barrel': '➮➱➯➭➫━',
// 'warning' : '░▒▓▓▒'
];

Spinner.prototype.start = function(message){
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

var frames = process.platform === 'win32' ?
	['-', '\\', '|', '/'] :
	['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

frames = '▁▂▃▄▅▆▇█▇▆▄▂▁'.split('')

function elegantSpinner() {
	var i = 0;

	return function () {
		return frames[i = ++i % frames.length];
	};
};
