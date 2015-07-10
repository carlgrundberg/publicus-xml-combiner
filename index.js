var iconv = require('iconv-lite');
var fs = require('fs');
var path = require("path");
var dir = 'e:/pub/';

var sites = [
    {
        name: 'skd',
        tax: 'Skånska Dagbladet',
        out: fs.createWriteStream('skd.xml'),
        count: 0
    },
    {
        name: 'nsk',
        tax: 'Norra Skåne',
        out: fs.createWriteStream('nsk.xml'),
        count: 0
    },
    {
        name: 'lt',
        tax: 'Laholms Tidning',
        out: fs.createWriteStream('lt.xml'),
        count: 0
    }
];

console.log('Reading directory ' + dir);

function fileheader(site) {
    var out = site.out;
    out.write('<?xml version="1.0" encoding="utf8"?>\n');
    out.write('<articles>\n');
}

function filefooter(site) {
    var out = site.out;
    out.write('</articles>\n');
}

fs.readdir(dir, function (err, files) {
    if (err) throw err;

    sites.map(fileheader);

    for(var i = 0; i < files.length; i++) {
        var file = files[i];
        if (path.extname(file) === ".xml") {
            console.log(file);
            var input = iconv.decode(fs.readFileSync(dir + file), 'win1252');
            input.replace('<?xml version="1.0" encoding="windows-1252"?>', '');
            var tax = input.match(/<taxonomytext><\!\[CDATA\[(.*)\]\]><\/taxonomytext>/);
            if(tax) {
                for(var j = 0; j < sites.length; j++) {
                    var site = sites[j];
                    if(tax[1].indexOf(site.tax) != -1) {
                        console.log('Appending to ' + site.name);
                        site.out.write(input);
                        site.count++;
                    }
                }
            }
        }
    }

    console.log('Number of articles appended for each site');
    for(j = 0; j < sites.length; j++) {
        site = sites[j];
        console.log(site.name + ':' + site.count);
    }
    sites.map(filefooter);
});


