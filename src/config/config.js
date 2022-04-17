const dotenv = require('dotenv');

dotenv.config();

const serverSettings = {
    port: process.env.PORT || 80
}

const dbSettings = {
    database: process.env.PGDATABASE || 'defaultdb',
    user: process.env.PGUSER || 'francesco',
    password: process.env.PGPASSWORD || '12345',
    server: process.env.PGHOST || '0.0.0.0',
    port: process.env.PGPORT || '5432'
}

const secretKey = "secret-key"

module.exports = Object.assign({}, { dbSettings, serverSettings, secretKey });
