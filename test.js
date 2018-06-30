var stat = require('folder-stat');
var path = require('path');

stat('o:\\tmpinst\\', (err, stats, files) => {
    console.log(stats);
    console.log(files);
});
