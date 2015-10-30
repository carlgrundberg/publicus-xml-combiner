var iconv = require('iconv-lite');
var fs = require('fs-extra');
var path = require("path");
var Entities = require('html-entities').XmlEntities;
var entities = new Entities();
var args = process.argv.slice(2);
var DOMParser = require('xmldom').DOMParser;

if (args.length < 2) {
    console.log('Please specify input and output directories.');
    return;
}
var indir = path.normalize(args[0]);
var outdir = path.normalize(args[1]);

if (!fs.statSync(indir).isDirectory()) {
    console.log('Input directoy does not exist!', indir);
    return;
}

if (!fs.statSync(outdir).isDirectory()) {
    console.log('Output directoy does not exist!', outdir);
    return;
}

var sites = [
    {
        name: 'skd',
        tax: ['Skånska Dagbladet', 'Lund', 'Malmö', 'Burlöv', 'Eslöv', 'Hörby', 'Kävlinge', 'Landskrona', 'Lomma', 'Nordost', 'Sjöbo', 'Svedala', 'Svalöv', 'Trelleborg', 'Vellinge', 'Ystad', 'Höör', 'Arlöv', 'Åkarp', 'Helsingborg', 'Bjuv', 'Klippan', 'Ängelholm', 'Örkelljunga', 'Åstorp', 'Dalby', 'Genarp', 'Södra Sandby', 'Veberöd', 'Blentarp', 'Veberöd', 'Vollsjö', 'Kivik', 'Simrishamn', 'Tomelilla'],
    },
    {
        name: 'nsk',
        tax: ['Norra Skåne', 'Hässleholm', 'Bjärnum', 'Hästveda', 'Tyringe', 'Vankiva', 'Vinslöv', 'Vittsjö', 'Kristianstad', 'Arkelstorp', 'Bromölla', 'Tollarp', 'Åhus', 'Markaryd', 'Osby', 'Perstorp', 'Östra Göinge', 'Broby', 'Hanaskog', 'Knislinge'],
    },
    {
        name: 'lt',
        tax: ['Laholms Tidning', 'Laholm', 'Borås', 'Båstad', 'Halmstad'],
    }
];

function fileheader(site, out) {
    out.write('<?xml version="1.0" encoding="utf8"?>\n');
    out.write('<articles>\n');
}

function filefooter(site, out, currentOutDir) {
    out.write('</articles>\n');
    out.end();
    out.on('finish', function () {
        var file = path.join(currentOutDir, site.name + '.xml');
        doc = new DOMParser().parseFromString(file, 'text/xml');
    });
}

function bundle(dir) {
    var absDir = path.join(indir, dir);
    console.log("bundling", absDir);
    fs.readdir(absDir, function (err, files) {
        if (err) throw err;

        var out = [];
        var counts = [];
        var currentOutDir = path.join(outdir, dir);

        sites.forEach(function(site, i) {
            out[i] = fs.createOutputStream(path.join(currentOutDir, site.name + '.xml'));
            counts[i] = 0;
            fileheader(site, out[i]);
        });

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (path.extname(file) === ".xml") {
                var input = entities.decode(iconv.decode(fs.readFileSync(path.join(absDir,file)), 'win1252').replace('<?xml version="1.0" encoding="windows-1252"?>', ''));
                input = input.replace(/<script[\s\S]*?<\/script>/g, '');
                //input = input.replace(/(\<\!\[CDATA\[.*)\<\!\[CDATA\[(.*)\]\]\>(.*\]\]\>)/g, '$1$2$3');
                input = input.replace(/<ExtLinkURI>[^<]*<\/ExtLinkURI>/g, '');
                input = input.replace(/<b>([^<]*<\/b[^>])/ig, '$1');
                input = input.replace(/<br>/ig, '<br/>');
                var tax = input.match(/<taxonomytext><\!\[CDATA\[(.*)\]\]><\/taxonomytext>/);
                if (tax) {
                    for (var j = 0; j < sites.length; j++) {
                        var site = sites[j];
                        for (var k = 0; k < site.tax.length; k++) {
                            if (tax[1].indexOf(site.tax[k]) != -1) {
                                out[j].write(input);
                                counts[j]++;
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
            console.log(site.name + ':' + counts[j]);
        }
        sites.forEach(function(site, i) {
            filefooter(site, out[i], currentOutDir);
        });
    });
}

function readDir(dir) {
    var absDir = path.join(indir, dir);
    fs.readdir(absDir, function (err, files) {
        if (err) throw err;

        for (var i = 0; i < files.length; i++) {
            file = path.join(dir, files[i]);
            var stat = fs.statSync(path.join(indir, file));
            if(stat.isDirectory()) {
                readDir(file);
            }
            if (path.extname(file) === ".xml") {
                bundle(dir);
                break;
            }
        }
    });
}

readDir(".");


