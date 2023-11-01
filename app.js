const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');

// Use session middleware
app.use(session({
  secret: 'sessionkey',
  resave: false,
  saveUninitialized: false
}));
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Povezivanje na PostgreSQL bazu podataka
const pool = new Pool({
  user: 'postgres_db_qgmw_user',
  host: 'dpg-cl0f72is1bgc73a12mm0-a',
  database: 'postgres_db_qgmw',
  password: 'U0GUQNQ4jwkKm8Xmx28ldyrd3B06df73',
  port: 5432,
});

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const users = [];
    res.render('index', { users });
});

app.post('/search', async (req, res) => {
  const checkBox = req.body.sqlcheck; 
    console.log({...req.body});

    if(checkBox){
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
    } else {
      const searchTerm = req.body.id.toString();
      var isValid = true;

      if (!searchTerm.match(/^[a-zA-Z0-9_-]+$/)) {
          isValid = false;
        }

      var query = 'SELECT * FROM users WHERE id = ';
      query = query + searchTerm;
      
      if(isValid){
      pool.query(query, (error, results) => {
          if (error) {
              res.redirect('/');
          }
          const users = results.rows;
          res.render('index', { users });
          
        });
    } else {
      res.redirect('/');
    }
  }
  });
  
// A simplified example of broken authentication
const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
];

const users2 = [
  { id: 1, username: 'user1', password: 'racunarstvojezanimljivojeej' }
  ];
  users2.forEach(async (user) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
  });
  
passport.use(new LocalStrategy(
  async (username, password, done) => {
    const user = users2.find(u => u.username === username);
    if (!user) {
      return done(null, false);
    }
    try {
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (isPasswordMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } catch (error) {
      return done(error);
    }
  }
  ));

  passport.serializeUser((user, done) => {
      done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    const user = users2.find(u => u.id === id);
    done(null, user);
  });

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
    }
    app.get('/protected2', ensureAuthenticated, (req, res) => {
      res.redirect('/protected')
    });

// Render the login form
app.get('/login', (req, res) => {
  res.render('login');
});

var isCheck = false;

app.get('/profileView', (req, res) => {
  res.render('profileView');
});

app.get('/protected',ensureAuthenticated, (req, res) => {
  res.render('protected');
});

// Authenticate users
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const checkBox = req.body.loginCheck; 
  if(checkBox){
    isCheck=true;
    const user = users.find((user) => user.username === username);

    if (user && user.password === password) {
      res.redirect('/profile');
    } else {  
      res.redirect('/login');
    }
  }else{
    isCheck = false;
    passport.authenticate('local', {
      successRedirect: '/profile',
      failureRedirect: '/login',
      failureFlash: true,
    })(req, res);
  }
});

app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/profile', (req, res) => {
  console.log(isCheck);
  if(isCheck === false){
    if (req.isAuthenticated()) {
    
      res.redirect('/protected2');
  } else{
    res.redirect('/login');
  }
}
  else {
    res.redirect('/profileView');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
