// <----- Import Modules/Libraries ----->
// lodd express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// load mongoose
const {mongoose} = require('./db/mongoose');

// load all models
const {users} = require('./models/users');
const {incomes} = require('./models/incomes');
const {expenses} = require('./models/expenses');

// load underscore
const _ = require('underscore');

// load body-parser
const bodyParser = require('body-parser');

// load middleware
const middleware = require('./middleware/middleware');

// load auth
const auth = require('./auth/auth');

// load appLogic
const appLogic = require('./appLogic/appLogic');

// load bcryptjs
const bcrypt =require('bcryptjs');

// <----- Middleware ----->
app.use(bodyParser.json());

// <----- User Section ----->
// Create User
app.post('/users', (req, res) => {
  // request body of user request
  const body = _.pick(req.body, 'email', 'password');

  // check password length
  if(body.password.length < 5 || body.password.length > 200) {
    return res.status(400).send('Password Length Must Be Between 5 to 200');
  }

  // Promise for hashing password
  const hashing =  function(password) {
    return new Promise((resolve, reject) => {
      const salt = bcrypt.genSaltSync(10);
      const hashed_password = bcrypt.hashSync(password, salt);
      resolve(hashed_password);
    });
  };

  // Hash the password and add data to database
  hashing(body.password)
  .then(hashed_pw => {
    const user = new users({
      email: body.email,
      password: hashed_pw
    });
    //save to database
    user.save()
    .then(user_details => {
      res.status(200).send(user_details.toPublicJSON());
    })
    .catch(err => {
      res.status(500).send(err.message)
    });
  })
  .catch(err => {
    res.status(500).send(err.message);
  });
});

// Login
app.post('/users/login', (req, res) => {

});

// Logout
app.delete('/users/logout', (req, res) => {

});

// <----- App Section ----->
// Root - Get All Data
app.get('/', (req, res) => {

});

// Create New Entry
app.post('/budget', (req, res) => {

});

// View by id
app.get('/budget/:id', (req, res) => {

});

// Update
app.put('/budget/:id', (req, res) => {

});

// Delete Entry
app.delete('/budget/:id', (req, res) => {

});

// <----- App Listen ----->
app.listen(PORT, () => {
  console.log(`App Started On Port: ${PORT}`);
});
