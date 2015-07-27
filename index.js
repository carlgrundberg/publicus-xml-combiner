var iconv = require('iconv-lite');
var fs = require('fs');
var path = require("path");
var indir = 'F:/pubarchive/2014_Jan-July/';
var outdir = 'F:/pubarchive_combined/2014_Jan-July/';

var sites = [
    {
        name: 'skd',
        tax: ['Skånska Dagbladet', 'Lund', 'Malmö', 'Burlöv', 'Eslöv', 'Hörby', 'Kävlinge', 'Landskrona', 'Lomma', 'Nordost', 'Sjöbo', 'Svedala', 'Svalöv', 'Trelleborg', 'Vellinge', 'Ystad', 'Höör', 'Arlöv', 'Åkarp', 'Helsingborg', 'Bjuv', 'Klippan', 'Ängelholm', 'Örkelljunga', 'Åstorp', 'Dalby', 'Genarp', 'Södra Sandby', 'Veberöd', 'Blentarp', 'Veberöd', 'Vollsjö', 'Kivik', 'Simrishamn', 'Tomelilla'],
        out: fs.createWriteStream(outdir + 'skd.xml'),
        count: 0
    },
    {
        name: 'nsk',
        tax: ['Norra Skåne', 'Hässleholm', 'Bjärnum', 'Hästveda', 'Tyringe', 'Vankiva', 'Vinslöv', 'Vittsjö', 'Kristianstad', 'Arkelstorp', 'Bromölla', 'Tollarp', 'Åhus', 'Markaryd', 'Osby', 'Perstorp', 'Östra Göinge', 'Broby', 'Hanaskog', 'Knislinge'],
        out: fs.createWriteStream(outdir + 'nsk.xml'),
        count: 0
    },
    {
        name: 'lt',
        tax: ['Laholms Tidning', 'Laholm', 'Borås', 'Båstad', 'Halmstad'],
        out: fs.createWriteStream(outdir + 'lt.xml'),
        count: 0
    }
];

console.log('Reading directory ' + indir);

function fileheader(site) {
    var out = site.out;
    out.write('<?xml version="1.0" encoding="utf8"?>\n');
    out.write('<articles>\n');
}

function filefooter(site) {
    var out = site.out;
    out.write('</articles>\n');
}

fs.readdir(indir, function (err, files) {
    if (err) throw err;

    sites.map(fileheader);

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (path.extname(file) === ".xml") {
            console.log(file);
            var input = iconv.decode(fs.readFileSync(indir + file), 'win1252').replace('<?xml version="1.0" encoding="windows-1252"?>', '');
            var tax = input.match(/<taxonomytext><\!\[CDATA\[(.*)\]\]><\/taxonomytext>/);
            if (tax) {
                for (var j = 0; j < sites.length; j++) {
                    var site = sites[j];
                    for (var k = 0; k < site.tax.length; k++) {
                        if (tax[1].indexOf(site.tax[k]) != -1) {
                            console.log('Appending to ' + site.name);
                            site.out.write(input);
                            site.count++;
                            break;
                        }
                    }
                }
            }
        }
    }

    console.log('Number of articles appended for each site');
    for (j = 0; j < sites.length; j++) {
        site = sites[j];
        console.log(site.name + ':' + site.count);
    }
    sites.map(filefooter);
});


