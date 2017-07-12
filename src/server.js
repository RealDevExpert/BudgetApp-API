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

// <----- App Section ----->

// <----- App Listen ----->
app.listen(PORT, () => {
  console.log(`App Started On Port: ${PORT}`);
});
