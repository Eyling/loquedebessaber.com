// ### Production
production: {
  url: 'http://my-blog.com',
  mail: {
    transport: 'SMTP',
    host: 'smtp.mandrillapp.com',
    options: {
      service: 'Mandrill',
      auth: {
        user: process.env.MANDRILL_USERNAME,
        pass: process.env.MANDRILL_APIKEY
      }
    }
  },
  database: {
    client: 'postgres',
    connection: process.env.DATABASE_URL,
    debug: false
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT
  }
}
