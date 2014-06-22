function config(){
    // repository and domain data
    this.content = {
        repository: {
            url: 'https://github.com/Eyling/loquedebessaber_content.git',
            name: 'loquedebessaber_content'
        },
        domain: 'http://loquedebessaber.com'
    }

    // web data
    this.web =  {
        title: 'Lo que debes saber'
    }

    // rss
    this.rss = {
        title:          this.web.title,
            description:    'Blog enfocado en un sentido humanista.',
            link:           this.content.domain,
            image:          this.content.domain + '/img/logo.png',
            copyright:      'Todos los derechos reservados 2014, Eyling Montenegro',
            author: {
            name:       'Eyling Montenegro'
        }
    }

    // links
    this.links = {
        article: 'articulo'
    }

    this.lang = 'es'

}

var config = new config();

module.exports = config;