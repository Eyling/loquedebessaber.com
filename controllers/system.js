// load require modules
var sys = require('sys');
var exec = require('child_process').exec;
var fs = require('fs');
var md = require("node-markdown").Markdown;
var path = require('path');
var crypto = require('crypto');
var moment = require('moment');
var config = require('../config');
var Feed = require('feed');
var helpers = require('../helpers');
moment.lang("es");


// home
exports.home = function (req, res) {
    var data = {};
    data.title = config.web.title;
    data.type = 'home';
    data.articles = helpers.fs.getArticles();
    res.render('index', { data: data });
}


// hook
exports.hook  = function (req, res) {
    // execute sh command
    exec(config.repository.exec, function(error, stdout, stderr){
        console.log(stdout);
    });

    // Create json files on data folder
    helpers.fs.setArticles('articles');

    // output
    res.send('{status:true}\n');
}


// article
exports.article = function (req, res) {

    if( helpers.fs.exists( 'json', req.params.slug, 'articles' ) && helpers.fs.exists( 'markdown', req.params.slug, 'articles' )  ){

        var data = JSON.parse( helpers.fs.getContent( 'json', req.params.slug ) );
        data.content = md(helpers.fs.getContent( 'markdown', req.params.slug ));
        data.date = moment(data.date).fromNow();

        if (data.update != "") {
            data.update = moment(data.update).fromNow();
        }

        var author = helpers.fs.getAuthor( data.author );
        author.picture = crypto.createHash('md5').update(author.email).digest("hex");

        data.author = author;

        res.render('article', { data: data });
    }
    else{
        res.redirect('/');
    }

}


// rss
exports.rss = function(req, res){
    var feed = new Feed(config.rss);

    var data = {};
    data.title = config.web.title;
    data.type = 'home';

    var data = JSON.parse( helpers.fs.getArticles() );

    data.rows.forEach(function(item){
        feed.item({
            title:          item.title,
            link:           config.content.domain + item.href,
            date:           new Date(item.date_format),
            image:          item.thumbnails,
            description:    item.content
        });

    });

    var xml = feed.render('rss-2.0');

    res.send( xml );

}