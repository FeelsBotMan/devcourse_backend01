const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true
});


connection.query('SELECT * FROM users', (err, results) => {
  if (err) throw err;
  console.log(results);
});

module.exports = connection;