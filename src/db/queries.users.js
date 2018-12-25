// #1
const User = require("./models").User;
const bcrypt = require("bcryptjs");
const Post = require("./models").Post;
const Comment = require("./models").Comment;
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
        confirmationCode: token
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
   // #2
        if(!user) {
          callback(404);
        } else {
   // #3
          result["user"] = user;
   // #4
          Post.scope({method: ["lastFiveFor", id]}).all()
          .then((posts) => {
   // #5
            result["posts"] = posts;
   // #6
            Comment.scope({method: ["lastFiveFor", id]}).all()
            .then((comments) => {
   // #7
              result["comments"] = comments;
              Post.scope({method: ["favoritedPosts", id]}).all()
              .then((favoritedPosts) => {
                result["favoritedPosts"] = favoritedPosts;
                callback(null, result);
              });
            })
            .catch((err) => {
              callback(err);
            })
          })

        }
      })
    }

}
