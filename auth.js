var facebookStrategy = require('passport-facebook'),
    LocalStrategy = require('passport-local').Strategy, 
    RememberMeStrategy = require('passport-remember-me').Strategy;
    //Include user model
    var User = require('./models/User'),
    Token = require('./models/Token'),
    utilities = require('./utils.js');

module.exports = function(passport){
   var issueToken = function(user, done){
        var token = utilities.randomString(64);
        Token.save(token, user._id, function(err) {
          if (err) { return done(err); }
          return done(null, token);
        });
    };

    /*
    * Implement Facebook Strategy
    */
    passport.use(new facebookStrategy({
        clientID        : '145353695503031',
        clientSecret    : 'f66c0b9b9797e0f6238d57ac7c52f260',
        callbackURL     : "http://localhost:3000/auth/facebook/return"
    },function(accessToken, refreshToken, profile, done){
        User.oAuthLogin(profile,done);
    }));


    passport.use(new LocalStrategy({
            usernameField : 'identifier',
            passwordField : 'code'
        },function(emailOrPhone, password, done){
            process.nextTick(function(){
                    if(!utilities.isValidEmail(emailOrPhone) && !utilities.isValidPhone(emailOrPhone)){
                      return  done('Invalid request');
                    }
                    User.verify(emailOrPhone, password ,function(error, user){
                        if(error){
                            return done(error);
                        }
                        if(!user){
                            return done('Could not found user by identifier : ' + emailOrPhone + ' with the specified code. Please authenticate to get a new code.');
                        }
                        done(null, user);
                    });
                });
        })
    );

    passport.serializeUser(function(user, done) {
      done(null, (user.email || user.phone));
    });
    passport.deserializeUser(function(identifier, done) {
        User.findByIdentifier(identifier,done);
    });

    passport.use(new RememberMeStrategy(
      function(token, done) {
        Token.consume(token, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          return done(null, user);
        });
      },
      issueToken
    ));

}
