// content = articles, authors, news, etc
var content = {};
content.repository = {};
content.repository.url = 'https://github.com/Eyling/loquedebessaber_content.git';
content.repository.name = 'loquedebessaber_content';
content.domain = 'http://loquedebessaber.com/';

exports.content = content;

var web = {};

web.title = 'Lo que debes saber';

exports.web = web;

var repository = {};

repository.exec = 'sh /sites/loquedebessaber.com/loquedebessaber_content/post-receive.sh';

exports.repository = repository;

var rss = {
    title:          'Lo que debes saber',
    description:    'Blog enfocado en un sentido humanista.',
    link:           'http://loquedebessaber.com/',
    image:          'http://loquedebessaber.com/img/logo.png',
    copyright:      'Todos los derechos reservados 2014, Eyling Montenegro',

    author: {
        name:       'Eyling Montenegro'
    }
}

exports.rss = rss;

var links = {
    article: 'articulo'
}

exports.links = links;

exports.lang = 'es';