'use strict';

var Table = require('cli-table');


module.exports = function(data){
    // instantiate
    var table = new Table({
        head: ['Path', 'Date'],
        colWidths: [40, 50]
    });

    var out = [];
    data.map(function(file){
        table.push([file.Key, file.LastModified]);
    });

    console.log(table.toString());
};
