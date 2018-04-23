// load users
const {users} = require('./../models/users');

// export function which authenticates the users
module.exports = function() {
  return {
    requireAuthentication: (req, res, next) => {
      // get token from header
      const token = req.header('Auth');

      // check the user exists with the token or not
      users.findbyToken(token)
      .then(user => {
        req.user = user;
        req.token = token;
        next();
      })
      .catch(err => {
          const resp = {
              status: "error",
              error: err
          };
        res.status(401).send(resp);
      })
    }
  }
};
