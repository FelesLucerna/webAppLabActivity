const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Use DATABASE_URL if set (Render), otherwise fall back to the PSQL_* variables
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: false }
          }
        : {
              user: process.env.PSQL_USER,
              host: process.env.PSQL_HOST,
              database: process.env.PSQL_DATABASE,
              password: process.env.PSQL_PASSWORD,
              port: process.env.PSQL_PORT,
              ssl: { rejectUnauthorized: false }
          }
);

// Shut down the pool cleanly (Render sends SIGTERM, Ctrl+C sends SIGINT)
function shutdown() {
    pool.end();
    console.log('Application successfully shutdown');
    process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const data = { name: 'Mario' };
    res.render('index', data);
});

app.get('/user', (req, res) => {
    pool
        .query('SELECT * FROM teammembers;')
        .then(query_res => {
            res.render('user', { teammembers: query_res.rows });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Database error');
        });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});