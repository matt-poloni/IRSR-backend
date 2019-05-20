require('dotenv').config();

const localPG = db => ({
  host: process.env.HOST,
  database: db,
  user: process.env.USER,
  password: process.env.PASS || ''
});

const pgTest = localPG(process.env.DB_TEST);
const pgDev = localPG(process.env.DB_DEV);

const dbSettings = (seedDir, connection) => ({
  client: 'pg',
  connection,
  debug: seedDir === 'dev',
  pool: {
    min: 2,
    max: 10
  },
  useNullAsDefault: true,
  migrations: {
    directory: './data/migrations'
  },
  seeds: {
    directory: `./data/seeds/${seedDir}`
  }
});

module.exports = {
  test: dbSettings('test', pgTest),
  development: dbSettings('dev', pgDev),
  production: dbSettings('prod', process.env.DATABASE_URL)
};