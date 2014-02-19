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


// command lines puts
function puts(error, stdout, stderr) {
    sys.puts(stdout);
}

// home
exports.home = function (req, res) {
    function out() {
        var data = {};
        data.title = config.web.title;
        data.type = 'home';
        var path_articles = path.join(__dirname, '../', 'articles.json');

        fs.readFile(path_articles, 'utf-8', function (err, articles) {
            if (err){
                res.send('Error loading JSON articles');
            }
            else{
                // set articles object
                data.articles = JSON.parse( articles );
                res.render('index', { data: data });

            }
        });
    }

    return out();
}

// hook
exports.hook  = function (req, res) {
    function create( type ){
        // set directory files
        var dir = path.join(__dirname, '../' + config.content.repository.name + '/' +type + '/', '');


        var data = new Array();

        // read directory
        fs.readdir(dir, function (err, files) {
            if (err) throw err;
            var c = 0;

            // recore files
            files.forEach(function (file) {

                // read file
                fs.readFile(dir + file, 'utf-8', function (err, json_file) {
                    c++;
                    if (err) throw err;

                    // if file mime/type = text/json
                    if (file.split('.').pop() === "json") {
                        var json = JSON.parse(json_file);
                        var obj_item = {};
                        obj_item.date_format = json.date;
                        obj_item.date = moment(json.date).format('MMMM Do YYYY, h:mm:ss a');
                        obj_item.title = json.title;
                        obj_item.thumbnails = json.thumbnails;
                        switch(json.type){
                            case "article":
                                obj_item.href = "/articulo/" + file.replace("." + file.split('.').pop(), '');
                                break;
                        }

                        data.push(obj_item);
                    }

                    // if finish load al files
                    if (files.length == c) {
                        // order object by date
                        var new_item = data.sort(function (a, b) {
                            return (new Date(b.date_format).getTime() - new Date(a.date_format).getTime());
                        });


                        // create a json objet
                        var export_json = {};

                        //export_json.type = 'home';
                        export_json.rows = new_item;
                        switch(type){
                            case "articles":
                                export_json.title = 'Artículos - ' +  config.web.title;
                                break;
                        }


                        // export a json file
                        fs.writeFile('./' + type + '.json', JSON.stringify(export_json), function (error) {
                            if (error) {
                                res.send(error)
                            }
                            else{
                                res.send(JSON.stringify(export_json));
                            }
                        });
                    }
                });
            });
        });
    }

    function out() {
        exec(config.repository.exec, puts);

        create('articles');

        res.send('true');
    }

    return out();
}

// articles
exports.articles = function (req, res) {
    function out() {
        var path_articles = path.join(__dirname, '../', 'articles.json');

        fs.readFile(path_articles, 'utf-8', function (err, data) {
            if (err){
                res.send('Error loading JSON articles file');
            }
            else{
                res.render('articles', { data: JSON.parse(data) });
            }
        });
    }

    return out();
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

exports.rss = function(req, res){
    var feed = new Feed(config.rss);

    var data = {};
    data.title = config.web.title;
    data.type = 'home';
    var path_articles = path.join(__dirname, '../', 'articles.json');

    fs.readFile(path_articles, 'utf-8', function (err, articles) {
        if (err){
            res.send('Error loading JSON articles');
        }
        else{
            var data = JSON.parse( articles );


            data.rows.forEach(function(item){
                feed.item({
                    title:          item.title,
                    link:           config.content.domain + item.href,
                    date:           new Date(item.date_format),
                    image:          item.thumbnails
                });

            });

            var xml = feed.render('rss-2.0');

            res.send( xml );

        }
    });

}