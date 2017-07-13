// # Ghost Configuration
// Setup your Ghost install for various environments
// Documentation can be found at http://support.ghost.org/config/

var path = require('path'),
config;

config = {
  production: {
    url: 'http://www.loquedebessaber.com',
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
      debug: false,
      ssl: true
    },
    server: {
      host: '0.0.0.0',
      port: process.env.PORT
    }
  }
};

// Export config
module.exports = config;
