// load mongoose
const {mongoose} = require('./../db/mongoose');

// load schemas
let Schema = mongoose.Schema;

// load Validator for validation
const validate = require('validator');

// load bcryptjs
const bcrypt = require('bcryptjs');

// load JWT
const JWT = require('jsonwebtoken');

// Schema for User collection
const minlength = [5, 'The value of password is shorter than the minimum allowed length is {MINLENGTH}.'];
const maxlength = [200, 'The value of password is greater than the maximum allowed length is {MAXLENGTH}.'];
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (value) => validate.isEmail(value),
      message: `{VALUE} is not valid e-mail. Please try with another.`
    }
  },
  password: {
    type: String,
    required: true,
    minlength,
    maxlength
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});


// Instance Method
userSchema.methods.toPublicJSON =  function() {
  const user = this;
  return {
    id: user._id,
    email: user.email
  }
};

userSchema.methods.createJWT = function() {
  return new Promise((resolve, reject) => {
    const user = this;
    const access = 'auth';
    const id = user._id.toString();
    const tokenData = {
      id,
      access
    };

    // Create token
    const token = JWT.sign({token: tokenData}, 'deva2910').toString();

    // remove all tokens and add new one
    if(user.tokens.length > 0) {
      while(user.tokens.length > 0) {
        user.tokens.pop();
      }
      user.tokens.push({access, token});
    } else {
      user.tokens.push({access, token});
    }

    // save collection
    user.save()
    .then(user => {resolve(token)})
    .catch(err => {reject(err)});
  });
};


// Model Methods
userSchema.statics.findbyToken = function(token) {
  return new Promise((resolve, reject) => {
    const users = this;
    try {
      // decode the token
      const decodedToken = JWT.verify(token, 'deva2910');

      // data from token
      const id = decodedToken.token.id;
      const access = decodedToken.token.access;

      // find a user by Id
      if(id !== null) {
        users.findById(id)
        .then(user => {
          if(user.tokens[0].token === token) {
            resolve(user);
          } else {
            reject('Session Expired!!')
          }
        })
        .catch(err => {
          reject('Session Expired!!');
        });
      } else {
        reject('Not A Valid Authentication.')
      }
    } catch(e) {
      reject(e.message);
    }
  });
};

userSchema.statics.destroyToken = function(token) {
  const users = this;
  return new Promise((resolve, reject) => {
    console.log(token);
      users.findbyToken(token)
      .then(userDetails => {
        if(userDetails.tokens.length > 0) {
          while(userDetails.tokens.length > 0) {
            userDetails.tokens.pop();
          }
          userDetails.save()
          .then(user => {
            resolve(`Sucessfully Logged Out from: ${userDetails.email}`);
          })
          .catch(err => {
            reject(err.message);
          });
        } else {
          reject('Session Expired!!');
        }
    })
      .catch(err => {
        reject('No User Details Found.')
      });
  });
};


// create model
let users = mongoose.model('users', userSchema);

// export
module.exports = {
  users
};
