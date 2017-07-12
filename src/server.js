// <----- Import Modules/Libraries ----->
// lodd express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// load mongoose
const {mongoose} = require('./db/db/mongoose');

// load all models
const {users} = require('./models/users');
const {incomes} = require('./models/incomes');
const {expenses} = require('./models/expenses');

// load underscore
const _ = require('underscore');

// load body-parser
const bodyParser = require('body-parser');

// load middleware
const middleware = require('./../middleware/middleware');

// load auth
const auth = require('./../auth/auth');

// load appLogic
const appLogic = require('./../appLogic/appLogic');

// <----- Middleware ----->
app.use(bodyParser.json());

// <----- User Section ----->
// Create User
app.post('/users', (req, res) => {

});

// Login
app.post('/users/login', (req, res) => {

});

// Logout
app.delete('users/logout', (req, res) => {

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
