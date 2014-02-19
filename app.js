var express = require('express');
var app = express();
var newrelic = require('newrelic');
var helpers = require('./helpers');

var controllers = require('./controllers');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', controllers.system.home);
app.get('/articulo/:slug', controllers.system.article);
app.post('/hook', controllers.system.hook);

app.get('/rss', controllers.system.rss);

helpers.fs.setArticles( 'articles' );


app.listen(1919);
