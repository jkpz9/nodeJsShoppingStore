const LocalStrategy = require('passport-local').Strategy;
const userModel = require('../app/models/userModel');
const bcrypt = require('bcrypt');

module.exports = function(passport){
  // Local Strategy
  passport.use(new LocalStrategy(function(username, password, done){
    // Match Username
    let query = {
      username: username,
      password: password
    };

    // console.log(query);

    userModel.isExistedUsername(query.username)
    .then(user => {
      if (!user) {
        return done(null, false, { message: 'Username or password is incorrect' });
      }
      bcrypt.compare(query.password, user.encryptedPassword, function(err, isMatch){
        if(err) {
          return done(err);
        }
        if(isMatch){
          // only allow less secure fields store in session
          return done(null, { username: user.userName, 
                              firstName: user.firstName,
                              id: user.memberId , 
                              isAdmin: user.isAdmin,
                              email: user.emailAddress
                      });
        } else {
          return done(null, false, {message: 'Username or password is incorrect'});
        }
      });
    })
    .catch(err => {
      throw err;
    });
  }));

  passport.serializeUser(function(user, done) {
   console.log("serializeUser: " + user);
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    // User.findById(id)
    //     .then(user => {
    //       if(user) {
    //         console.log("deserializeUser: " + user);
    //         done(null, user);
    //       }
    //     })
    //     .catch(err => {
    //       done(err);
    //     });
    done(null, user);
    });
}
