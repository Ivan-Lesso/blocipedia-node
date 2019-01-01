// #1
const User = require("./models").User;
const bcrypt = require("bcryptjs");
const crypto = require('crypto');

module.exports = {
// #2
  createUser(newUser, callback){

// #3
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

//Confirmation code
    let token;
    crypto.randomBytes(20, function(err, buf) {
      token = buf.toString('hex');

      return User.create({
        email: newUser.email,
        password: hashedPassword,
        confirmationCode: token,
        role: 0
      })
      .then((user) => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      })
    });
  },
  getUser(id, callback){
   // #1
    let result = {};
    User.findById(id)
    .then((user) => {
      if(!user) {
        callback(404);
      } else {
        result["user"] = user;
        callback(null, result);
      }
    })
  },
  getUsers(callback){
   // #1
    let result = {};
    User.findAll()
    .then((users) => {
 // #2
      if(!users) {
        callback(404);
      } else {
        callback(null, users);
      }
    })
  },
  changeRole(user, role, callback){
    return User.findById(user.id)
    .then((user) => {
      if(!user){
        return callback("User not found");
      }
      user.update({
        role: role
      })
      .then(() => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      });
    });
  }
}
