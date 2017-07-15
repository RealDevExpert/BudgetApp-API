// <----- Import Modules/Libraries ----->
// lodd express
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// load mongoose
const {mongoose} = require('./db/mongoose');

// load ObjectID from MongoDB
const {ObjectID} = require('mongodb');

// load all models
const {users} = require('./models/users');
const {incomes} = require('./models/incomes');
const {expenses} = require('./models/expenses');

// load underscore
const _ = require('underscore');

// load body-parser
const bodyParser = require('body-parser');

// load middleware
const middleware = require('./middleware/middleware')(); // give user detail and token

// load auth
const auth = require('./auth/auth');

// load appLogic
const appLogic = require('./appLogic/appLogic');

// load bcryptjs
const bcrypt = require('bcryptjs');

// load dataStructure (Promise) pass -> req.user._id
const getDataStructure = require('./appLogic/appLogic');

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
      res.status(200).send(user_details.toPublicJSON()); // Only email
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
  // request body of user request
  const body = _.pick(req.body, 'email', 'password');

  // do authentication
  auth(body)
  .then(user => {
    user.createJWT()
    .then(tokenInstance => {
      res.header('Auth', tokenInstance).send(user.toPublicJSON());
    })
    .catch(err => {
      res.status(500).send(err.message);
    })
  })
  .catch(error => {
    res.status(400).send(error);
  })

});

// Logout
app.delete('/users/logout', middleware.requireAuthentication, (req, res) => {
  // requester's Id & token
  const user = req.user;
  const userId = req.user._id;
  const token = req.token;

  // destroy token
  if(userId !== null) {
    users.destroyToken(token)
    .then(success => {
      res.send(success);
    })
    .catch(err => {
      res.status(403).send(err);
    });
  } else {
    res.status(400).send('Some thing went wrong..!!')
  }

});

// <----- App Section ----->
// Root - Get All Data
app.get('/', middleware.requireAuthentication, (req, res) => {

});

// Create New Entry
app.post('/budget', middleware.requireAuthentication, (req, res) => {
  const body = _.pick(req.body, 'type', 'description', 'amount');

  const type = body.type;
  const description = body.description;
  const amount = body.amount;
  const creator_id = req.user._id;

  if(!_.isNumber(amount)) {
    return res.status(400).send('Amount Must Be Number');
  }

  if(description.trim().length < 1) {
    return res.status(400).send('Description Must Not be Empty');
  }

  if (type === 'Income' || 'INCOME' || 'INC' || 'inc' || 0 || 'i' || 'income') {
    const income = new incomes({
      description,
      amount,
      created: new Date(),
      updated: new Date(),
      creator_id
    });

    income.save()
    .then(income => {
      res.send(income);
    })
    .catch(err => {
      res.status(500).send(err.message);
    });

  } else if (type === 'Expense' || 'expense' || 'EXPENSE' || 'EXP' || 'exp' || 1 || 'e') {

    const expense = new expenses({
      description,
      amount,
      created: new Date(),
      updated: new Date(),
      creator_id
    });

    expense.save()
    .then(expense => {
      res.status(201).send(expense);
    })
    .catch(err => {
      res.status(400).send(err.message);
    });

  } else {
    return res.status(400).send('Please Specify Entry Type');
  }

});

// View by id
app.get('/budget/:id', middleware.requireAuthentication, (req, res) => {
  let entryIdArr = req.params.id;
  entryIdArr = entryIdArr.split('-');
  const type = entryIdArr[0];
  const entryId = entryIdArr[1];

  if(ObjectID.isValid(entryId)) {
    if(type === 'inc') {
      incomes.findOne({_id: entryId, creator_id: req.user._id})
      .then(income => {
        if(income !== null) {
          res.send(income);
        } else {
          res.status(404).send('No Data Found');
        }

      })
      .catch(err => {
        res.status(400).send('Something Went Wrong. Try Again!!');
      });
    } else if(type === 'exp') {
      expenses.findById(entryId)
      .then(expense => {
        res.send(expense);
      })
      .catch(err => {
        res.status(204).send('No Data Found');
      });

    } else {
      return res.status(400).send('Entry Type isn\'t Valid');
    }
  } else {
    res.status(400).send("Entry Id is not valid");
  }
});

// // Update
// app.put('/budget/:id', middleware.requireAuthentication, (req, res) => {
//   let entryIdArr = req.params.id;
//   entryIdArr = entryIdArr.split('-');
//   const type = entryIdArr[0];
//   const entryId = entryIdArr[1];
//   let userInput = {};
//
//   if(ObjectID.isValid(entryId)) {
//     if(type === 'inc') {
//       incomes.findOneAndUpdate({_id: entryId, creator_id: req.user._id}, {$set: userInput}, {new: true})
//       .then(updatedEntry => {
//         if(updatedEntry !== null) {
//
//         }
//       })
//     } else if(type === 'exp') {
//
//     } else {
//       res.status(400).send('Type Is Not Valid');
//     }
//
//   } else {
//     res.status(400).send('Entry Id Is Not Valid');
//   }
//
// });

// Delete Entry
app.delete('/budget/:id', middleware.requireAuthentication, (req, res) => {
  let entryIdArr = req.params.id;
  entryIdArr = entryIdArr.split('-');
  const type = entryIdArr[0];
  const entryId = entryIdArr[1];

 if(ObjectID.isValid(entryId)) {
  if(type === 'inc') {
    incomes.findOneAndRemove({_id: entryId, creator_id: req.user._id})
    .then(deletedId => {
      if(deletedId !== null) {
        res.send('Deleted Sucessfully');
      } else {
        res.status(404).send('No Data Found');
      }
    })
    .catch(err => {
      res.status(500).send('Something Went Worng. Please try Again.');
    });
  } else if (type === 'exp') {
    expenses.findOneAndRemove({_id: entryId, creator_id: req.user._id})
    .then(deletedId => {
      if(deletedId !== null) {
        res.send('Deleted Sucessfully');
      } else {
        res.status(404).send('No Data Found');
      }
    })
    .catch(err => {
      res.status(500).send('Something Went Worng. Please try Again.');
    });
  } else {
    res.send(400).send('Type Is Not Valid!!');
  }
} else {
  res.status(400).send('Entry Id Is Not Valid');
 }
});

// <----- App Listen ----->
app.listen(PORT, () => {
  console.log(`App Started On Port: ${PORT}`);
});
