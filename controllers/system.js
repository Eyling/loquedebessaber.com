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
var MemJS = require("memjs").Client;

memjs = MemJS.create(config.memcached.username+':'+config.memcached.password+'@'+config.memcached.server+':'+config.memcached.port,{});

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

        var mkey = 'home';


        memjs.get(mkey, function(err, value) {
            console.log( 'DEBUG: ' + err );

            if (value) {
                res.render('index', { data: value });
            }
            else{
                fs.readFile(path_articles, 'utf-8', function (err, data) {
                    if (err){
                        res.send('Error loading JSON articles file');
                    }
                    else{
                        memjs.set(mkey, JSON.parse(data));

                        res.render('index', { data: JSON.parse(data) });
                    }
                });

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
        var mkey = 'articles_file';
        var path_articles = path.join(__dirname, '../', 'articles.json');

        memjs.get(mkey, function(err, value) {
            if (value) {
                res.render('articles', { data: value });
            }
            else{
                fs.readFile(path_articles, 'utf-8', function (err, data) {
                    if (err){
                        res.send('Error loading JSON articles file');
                    }
                    else{
                        memjs.set(mkey, JSON.parse(data));

                        res.render('articles', { data: JSON.parse(data) });
                    }
                });

            }
        });

       /*

        fs.readFile(path_articles, 'utf-8', function (err, data) {
            if (err){
                res.send('Error loading JSON articles file');
            }
            else{
                res.render('articles', { data: JSON.parse(data) });
            }
        });
        */
    }

    return out();
}

// article
exports.article = function (req, res) {
    function out() {

        var mkey = req.params.slug;

        memjs.get(mkey, function(err, value) {
            if (value) {
                res.render('article', { data: value });
            }
            else{
                // set path to article files
                var path_article_json = path.join(__dirname, '../' + config.content.repository.name + '/articles', req.params.slug + '.json');
                var path_article_markdown = path.join(__dirname, '../' + config.content.repository.name + '/articles', req.params.slug + '.markdown');
                // load article json
                fs.readFile(path_article_json, 'utf8', function (err1, article_json) {
                    if (err1) {
                        res.send('Error loading JSON article file');
                    }
                    else {
                        // load article markdown
                        fs.readFile(path_article_markdown, 'utf8', function (err2, article_markdown) {
                            if (err2) {
                                res.send('Error loading MARKDOWN article file');
                            }
                            else {
                                // set article object
                                var article_obj = JSON.parse(article_json);

                                // load author json
                                var path_author_json = path.join(__dirname, '../' + config.content.repository.name + '/authors', article_obj.author + '.json');

                                fs.readFile(path_author_json, 'utf8', function (err3, author_json) {
                                    if (err3) {
                                        res.send('Error loading MARKDOWN article file');
                                    }
                                    else {
                                        // set markdown to html content in article object
                                        article_obj.content = md(article_markdown);

                                        // set date from string reading
                                        article_obj.date = moment(article_obj.date).fromNow();

                                        if (article_obj.update != "") {
                                            article_obj.update = moment(article_obj.update).fromNow();
                                        }

                                        // set author object
                                        var author_obj = JSON.parse(author_json);

                                        // set md5 hash to load picture from gravatar.com
                                        author_obj.picture = crypto.createHash('md5').update(author_obj.email).digest("hex");

                                        // set author object on article object
                                        article_obj.author = author_obj;

                                        memjs.set(mkey, article_obj);

                                        // load article template with article object
                                        res.render('article', { data: article_obj });
                                    }
                                });

                            }
                        });
                    }
                });


            }
        });


        /*


        // set path to article files
        var path_article_json = path.join(__dirname, '../' + config.content.repository.name + '/articles', req.params.slug + '.json');
        var path_article_markdown = path.join(__dirname, '../' + config.content.repository.name + '/articles', req.params.slug + '.markdown');
        // load article json
        fs.readFile(path_article_json, 'utf8', function (err1, article_json) {
            if (err1) {
                res.send('Error loading JSON article file');
            }
            else {
                // load article markdown
                fs.readFile(path_article_markdown, 'utf8', function (err2, article_markdown) {
                    if (err2) {
                        res.send('Error loading MARKDOWN article file');
                    }
                    else {
                        // set article object
                        var article_obj = JSON.parse(article_json);

                        // load author json
                        var path_author_json = path.join(__dirname, '../' + config.content.repository.name + '/authors', article_obj.author + '.json');

                        fs.readFile(path_author_json, 'utf8', function (err3, author_json) {
                            if (err3) {
                                res.send('Error loading MARKDOWN article file');
                            }
                            else {
                                // set markdown to html content in article object
                                article_obj.content = md(article_markdown);

                                // set date from string reading
                                article_obj.date = moment(article_obj.date).fromNow();

                                if (article_obj.update != "") {
                                    article_obj.update = moment(article_obj.update).fromNow();
                                }

                                // set author object
                                var author_obj = JSON.parse(author_json);

                                // set md5 hash to load picture from gravatar.com
                                author_obj.picture = crypto.createHash('md5').update(author_obj.email).digest("hex");

                                // set author object on article object
                                article_obj.author = author_obj;

                                // load article template with article object
                                res.render('article', { data: article_obj });
                            }
                        });

                    }
                });
            }
        });
        */
    }

    return out();
}

exports.rss = function(req, res){
    var feed = new Feed({
        title:          'Lo que debes saber',
        description:    'Blog enfocado en un sentido humanista.',
        link:           'http://loquedebessaber.com/',
        image:          'http://loquedebessaber.com/img/logo.png',
        copyright:      'Todos los derechos reservados 2013, Eyling Montenegro',

        author: {
            name:       'Eyling Montenegro'
        }
    });


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