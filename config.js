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

repository.exec = '/var/www/html/loquedebessaber.com/loquedebessaber_content/post-receive.sh';

exports.repository = repository;