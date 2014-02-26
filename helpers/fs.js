var config = require('../config');
var fs = require('fs');
var path = require('path');
var md = require("node-markdown").Markdown;
var moment = require('moment');

moment.lang(config.lang);

var getPath = function( type, slug, folder ){
    var result = path.join(__dirname, '../' + config.content.repository.name + '/' + folder, slug + '.' + type);
    return result;
}


var getContent = function( type, slug ){
    return fs.readFileSync(getPath( type, slug, 'articles' ), 'utf8');
}


var getAuthor = function( slug ){
    return JSON.parse(fs.readFileSync(getPath( 'json', slug, 'authors' ), 'utf8'));
}


var exists = function( type, slug, folder ){
    return fs.existsSync( getPath( type, slug, folder ) );
}


var getArticles = function(){
    return fs.readFileSync(path.join(__dirname, '../data', 'articles.json'), 'utf8');
}


var setArticles = function( type ){
    var directory = path.join(__dirname, '../' + config.content.repository.name + '/' +type + '/');

    var outDirectory = path.join(__dirname, '../data/' );

    var data = [];

    var files = fs.readdirSync( directory );

    files.forEach(function (file) {
        var slug = path.basename(file,'.json');

        // only json files
        if (file.split('.').pop() === 'json') {

            var json = JSON.parse( getContent( 'json', slug ) );

            var item = {};
            item.date_format = json.date;
            item.date = moment(json.date).format('MMMM Do YYYY, h:mm:ss a');
            item.title = json.title;
            item.thumbnails = json.thumbnails;
            item.content = md(getContent( 'markdown', slug ));
            item.href = '/' + config.links.article + '/' + slug;

            data.push(item);

        }

    });

    // order by date

    var rows = data.sort(function (a, b) {
        return (new Date(b.date_format).getTime() - new Date(a.date_format).getTime());
    });

    var output = {};
    output.rows = rows;
    output.title = config.web.title;

    if( !fs.existsSync( outDirectory ) ){
        fs.mkdirSync( outDirectory );
    }

    // write file
    fs.writeFileSync(outDirectory + type + '.json', JSON.stringify(output), 'utf8');

}


exports.getPath = getPath;
exports.getContent = getContent;
exports.getAuthor = getAuthor;
exports.getArticles = getArticles;
exports.setArticles = setArticles;
exports.exists = exists;