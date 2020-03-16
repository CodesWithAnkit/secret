//jshint esversion:6
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
require('dotenv').config();
const saltRound = 10;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// Connect to local MONGODB
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password']
});

const user = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

// Registring the user

app.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, saltRound, function(err, hash) {
    const newUser = new user({
      email: req.body.username,
      password: hash
    });

    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render('secrets');
      }
    });
  });
});

// Login the user
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  user.findOne({ email: username }, function(err, founded) {
    if (err) {
      console.log(err);
    } else {
      if (founded) {
        bcrypt.compare(password, founded.password, function(err, result) {
          if (result === true) {
            res.render('secrets');
          }
        });
      }
    }
  });
});

app.listen(5000, () => console.log('Listening at PORT 5000'));
