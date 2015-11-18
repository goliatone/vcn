'use strict';

var Table = require('cli-table');


module.exports = function(fields){

    var headers = Object.keys(fields);

    return function(data){

        var table = new Table({
            head: headers,
            colWidths: [40, 50]
        });

        var out;
        data.map(function(file){
            out = [];
            Object.keys(fields).map(function(field){
                out.push(file[fields[field]]);
            });

            table.push(out);
        });

        console.log(table.toString());
    };
};
