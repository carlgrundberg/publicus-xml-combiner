var q = require('q');
var fs = require('fs');
var path = require("path");
var dir = 'e:/pub/';
var outFile = 'articles.xml';

var out = fs.createWriteStream(outFile);

console.log('Reading directory ' + dir);

fs.readdir(dir, function (err, files) {
    if (err) throw err;

    out.write('<?xml version="1.0" encoding="windows-1252"?>\n');
    out.write('<articles>\n');

    for(var i = 0; i < files.length; i++) {
        var file = files[i];
        if (path.extname(file) === ".xml") {
            console.log(file);
            var input = fs.readFileSync(dir + file, { encoding: "utf8" });
            out.write(input.replace('<?xml version="1.0" encoding="windows-1252"?>', ''));
        }
    }

    console.log('All files appended');
    out.write('</articles>\n');
});


