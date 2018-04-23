// load users
const {users} = require('./../models/users');

// load bcrypt for comapring passwords
const bcrypt = require('bcryptjs');

module.exports = function(body) {
  return new Promise((resolve, reject) => {
    users.findOne({email: body.email})
    .then(user_details => {

      if(bcrypt.compareSync(body.password, user_details.get('password'))) {
        resolve(user_details);
      } else {
         reject('Password does not Match!!');
      }
    })
    .catch(err => {
      reject('No User Found!!')
    });

  });
};
