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

var memcached = {};
memcached.username = '98754e';
memcached.password = '93075757b8';
memcached.server = 'mc4.dev.ec2.memcachier.com';
memcached.port = '11211';

exports.memcached = memcached;