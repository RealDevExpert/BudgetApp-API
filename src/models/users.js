// load mongoose
const {mongoose} = require('./../db/mongoose');

// load schemas
let Schema = mongoose.Schema;

// load Validator for validation
const validate = require('validator');

// load bcryptjs
const bcrypt = require('bcryptjs');

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
  token: [{
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

// Model Methods

// Instance Method
userSchema.methods.toPublicJSON =  function() {
  const user = this;
  return {
    email: user.email
  }
};

// create model
let users = mongoose.model('users', userSchema);

// export
module.exports = {
  users
};
