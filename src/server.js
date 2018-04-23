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
const {setDataStructure, clearDataStructure} = require('./appLogic/appLogic');

// <----- Middleware ----->
app.use(bodyParser.json());

// <----- User Section ----->
// Create User
app.post('/budget/users/signup', (req, res) => {
    // request body of user request
    const body = _.pick(req.body, 'email', 'password');

    // check password length
    if(body.password.length < 5 || body.password.length > 200) {
        const resp = {
            status: "error",
            error: 'Password Length Must Be Between 5 to 200',
        };
        return res.status(400).send(resp);
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
                    const resp = {
                        status: "success",
                        data: user_details.toPublicJSON()
                    };
                    res.status(201).send(resp); // Only email
                })
                .catch(err => {
                    const resp = {
                        status: "error",
                        error: "User already exist with this email!"
                    };
                    res.status(409).send(resp)
                });
        });
        /*.catch(err => {
            const resp = {
                status: "error",
                data: "Something went wrong on our side! Please, try again later."
            };
            res.status(500).send(resp);
        });*/
});

// Login
app.post('/budget/users/login', (req, res) => {
    // request body of user request
    const body = _.pick(req.body, 'email', 'password');

    // do authentication
    auth(body)
        .then(user => {
            user.createJWT()
                .then(tokenInstance => {
                    const resp = {
                        status: "success",
                        data: user.toPublicJSON()
                    };
                    res.header('Auth', tokenInstance).send(resp);
                })
                .catch(error => {
                    const resp = {
                        status: "error",
                        error: error.message
                    };
                    res.status(401).send(resp);
                })
        })
        .catch(error => {
            const resp = {
                status: "error",
                message: error
            };
            res.status(401).send(resp);
        });
});

// Logout
app.delete('/budget/users/logout', middleware.requireAuthentication, (req, res) => {
    // requester's Id & token
    const user = req.user;
    const userId = req.user._id;
    const token = req.token;

    // destroy token
    if(userId !== null) {
        users.destroyToken(token)
            .then(success => {
                const resp = {
                    status: "success",
                    data: success
                };
                res.send(resp);
            })
            .catch(err => {
                const resp = {
                    status: "error",
                    error: err
                };
                res.status(403).send(resp);
            });
    } else {
        const resp = {
            status: "error",
            error: "Something went wrong!"
        };
        res.status(403).send(resp)
    }
});

// <----- Income/Expense Section ----->
// Root - Get All Data
app.get('/budget/all', middleware.requireAuthentication, (req, res) => {
    const userId = req.user._id.toString();
    clearDataStructure();
    setDataStructure(userId)
        .then(dataStructure => {
            const resp = {
                status: "success",
                data: dataStructure
            };
            res.status(200).send(resp);
        });
});

// Create New Entry
app.post('/budget/add', middleware.requireAuthentication, (req, res) => {
    const body = _.pick(req.body, 'type', 'description', 'amount');

    const type = body.type;
    const description = body.description;
    const amount = body.amount;
    const creator_id = req.user._id;

    if(!_.isNumber(amount) && amount < 1) {
        const resp = {
            status: "error",
            error: 'Amount Must Be Valid Number and Greater Than Zero( 0 )'
        };
        return res.status(400).send(resp);
    }

    if(description.trim().length < 1) {
        const resp = {
            status: "error",
            error: 'Description Must Not be Empty'
        };
        return res.status(400).send(resp);
    }

    if (type === 'Income') {
        const income = new incomes({
            description,
            amount,
            created: new Date(),
            updated: new Date(),
            creator_id
        });

        income.save()
            .then(income => {
                const resp = {
                    status: "success",
                    data: income
                };
                res.status(201).send(resp);
            })
            .catch(err => {
                const resp = {
                    status: "error",
                    error: err.message
                };
                res.status(500).send(resp);
            });
    } else if (type === 'Expense') {
        const expense = new expenses({
            description,
            amount,
            created: new Date(),
            updated: new Date(),
            creator_id
        });

        expense.save()
            .then(expense => {
                const resp = {
                    status: "success",
                    data: expense
                };
                res.status(201).send(resp);
            })
            .catch(err => {
                const resp = {
                    status: "error",
                    error: err.message
                };
                res.status(500).send(resp);
            });

    } else {
        const resp = {
            status: "error",
            error: "Please Specify Entry Type!"
        };
        return res.status(400).send(resp);
    }
});

// Get Income by id
app.get('/budget/income/:id', middleware.requireAuthentication, (req, res) => {
    const entryId = req.params.id;

    if(ObjectID.isValid(entryId)) {
        incomes.findOne({_id: entryId, creator_id: req.user._id})
            .then(income => {
                if(income !== null) {
                    const resp = {
                        status: "success",
                        data: income
                    };
                    res.status(200).send(resp);
                } else {
                    const resp = {
                        status: "error",
                        error: "No Data Found"
                    };
                    res.status(404).send(resp);
                }
            })
            .catch(err => {
                const resp = {
                    status: "error",
                    error: err.message
                };
                res.status(500).send(resp);
            });
    } else {
        const resp = {
            status: "error",
            error: "Invalid Entry Id!"
        };
        res.status(400).send(resp);
    }
});

// Get Expense by id
app.get('/budget/expense/:id', middleware.requireAuthentication, (req, res) => {
    const entryId = req.params.id;

    if(ObjectID.isValid(entryId)) {
        expenses.findOne({_id: entryId, creator_id: req.user._id})
            .then(expense => {
                if(expense !== null) {
                    const resp = {
                        status: "success",
                        data: expense
                    };
                    res.status(200).send(resp);
                } else {
                    res.status(404).send({status:"error", error: 'No Data Found'});
                }
            })
            .catch(err => {
                res.status(404).send({status:"error", error: 'No Data Found'});
            });
    } else {
        res.status(400).send({status:"error", error: 'Invalid Entry Id'});
    }
});

// Update Income by id
app.put('/budget/income/:id', middleware.requireAuthentication, (req, res) => {
    const entryId = req.params.id;
    let userInput = {};
    userInput.updated = new Date();

    if(req.body.hasOwnProperty('description') && _.isString(req.body.description) && req.body.description.trim().length > 0) {
        // update the value
        userInput.description = req.body.description.trim();
    } else if (req.body.hasOwnProperty('description')) {
        // return 400
        return res.status(400).send({status: "error", error: "Description is invalid!"});
    }

    if(req.body.hasOwnProperty('amount') && _.isNumber(req.body.amount) && req.body.amount > 0) {
        userInput.amount = req.body.amount;
    } else if (req.body.hasOwnProperty('amount')) {
        return res.status(400).send({status: "error", error: 'Amount Must Be Valid Number and Greater Than Zero( 0 )'});
    }

    if(ObjectID.isValid(entryId)) {
        incomes.findOneAndUpdate({_id: entryId, creator_id: req.user._id}, {$set: userInput}, {new: true})
            .then(updatedEntry => {
                if(updatedEntry !== null) {
                    res.send({status: "success", data: updatedEntry})
                } else {
                    res.status(404).send({status: "error", error: 'No Data Found'});
                }
            })
            .catch(err => {
                res.status(500).send({status: "error", error: err.message});
            });
    } else {
        res.status(400).send({status: "error", error: 'Invalid Entry Id'});
    }
});

// Update Expense by id
app.put('/budget/expense/:id', middleware.requireAuthentication, (req, res) => {
    const entryId = req.params.id;
    let userInput = {};
    userInput.updated = new Date();

    if(req.body.hasOwnProperty('description') && _.isString(req.body.description) && req.body.description.trim().length > 0) {
        // update the value
        userInput.description = req.body.description.trim();
    } else if (req.body.hasOwnProperty('description')) {
        // return 400
        return res.status(400).send({status: "error", error: "Description is invalid!"});
    }

    if(req.body.hasOwnProperty('amount') && _.isNumber(req.body.amount) && req.body.amount > 0) {
        userInput.amount = req.body.amount;
    } else if (req.body.hasOwnProperty('amount')) {
        return res.status(400).send({status: "error", error: 'Amount Must Be Valid Number and Greater Than Zero( 0 )'});
    }

    if(ObjectID.isValid(entryId)) {
        expenses.findOneAndUpdate({_id: entryId, creator_id: req.user._id}, {$set: userInput}, {new: true})
            .then(updatedEntry => {
                if(updatedEntry !== null) {
                    res.send({status: "success", data: updatedEntry})
                } else {
                    res.status(404).send({status: "error", error: 'No Data Found'});
                }
            })
            .catch(err => {
                res.status(500).send({status: "error", error: err.message});
            });
    } else {
        res.status(400).send({status: "error", error: 'Invalid Entry Id'});
    }
});

// Delete an Income by id
app.delete('/budget/income/:id', middleware.requireAuthentication, (req, res) => {
    const entryId = req.params.id;

    if(ObjectID.isValid(entryId)) {
        incomes.findOneAndRemove({_id: entryId, creator_id: req.user._id})
            .then(deletedId => {
                if(deletedId !== null) {
                    res.send({status: "success", data:"Deleted Successfully!"});
                } else {
                    res.status(404).send({status: "error", error: 'No Data Found'});
                }
            })
            .catch(err => {
                res.status(500).send({status: "error", error: 'Something Went Wrong. Please try Again.'});
            });
    } else {
        res.status(400).send({status: "error", error: "Invalid Entry Id!"});
    }
});

// Delete an Income by id
app.delete('/budget/expense/:id', middleware.requireAuthentication, (req, res) => {
    const entryId = req.params.id;

    if(ObjectID.isValid(entryId)) {
        expenses.findOneAndRemove({_id: entryId, creator_id: req.user._id})
            .then(deletedId => {
                if(deletedId !== null) {
                    res.send({status: "success", data:"Deleted Successfully!"});
                } else {
                    res.status(404).send({status: "error", error: 'No Data Found'});
                }
            })
            .catch(err => {
                res.status(500).send({status: "error", error: 'Something Went Wrong. Please try Again.'});
            });
    } else {
        res.status(400).send({status: "error", error: "Invalid Entry Id!"});
    }
});

// <----- App Listen ----->
app.listen(PORT, () => {
    console.log(`App Started On Port: ${PORT}`);
});
