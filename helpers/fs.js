var config = require('../config');
var fs = require('fs');
var path = require('path');


var getPath = function( type, slug, folder ){
    var result = path.join(__dirname, '../' + config.content.repository.name + '/' + folder, slug + '.' + type);
    return result;
}


var getContent = function( type, slug ){
    var result = fs.readFileSync(getPath( type, slug, 'articles' ), 'utf8');
    return result;
}


var getAuthor = function( slug ){
    var result = fs.readFileSync(getPath( 'json', slug, 'authors' ), 'utf8');
    return JSON.parse(result);
}


var exists = function( type, slug, folder ){
    return fs.existsSync( getPath( type, slug, folder ) );
}


exports.getPath = getPath;
exports.getContent = getContent;
exports.getAuthor = getAuthor;
exports.exists = exists;