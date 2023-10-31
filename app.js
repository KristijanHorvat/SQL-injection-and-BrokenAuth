const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Povezivanje na PostgreSQL bazu podataka
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'studAdmin',
  password: '5432',
  port: 5432,
});

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const users = [];
    res.render('index', { users });
});

app.post('/search', async (req, res) => {
    const searchTerm = req.body.id.toString();
    var query = 'SELECT * FROM users WHERE id = ';
    query = query + searchTerm;
    pool.query(query, (error, results) => {
        if (error) {
            res.redirect('/');
        }
        const users = results.rows;
        res.render('index', { users });
      });
    
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
