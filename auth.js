var passport = require('passport'),
facebookStrategy = require('passport-facebook'),
//Include user model
User = require('./models/User');

/*
* Implement Facebook Strategy
*/
passport.use(new facebookStrategy({
    clientID        : '145353695503031',
    clientSecret    : 'f66c0b9b9797e0f6238d57ac7c52f260',
    callbackURL     : "http://localhost:3000/auth/facebook/return",
},function(accessToken, refreshToken, profile, done){
    User.oAuthLogin(profile,done);
    /*User.findOne({
        id : profile.id
    },function(err, user){
        if(err){
            console.log(err);
        }
        if(!user){
            User.create(profile._json)
            .then(function(user){
                done(err, user);
            });
        } else
            done(err, user);
    });*/
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(id, done) {
  User.find({
    id : id
  },function(error, user){
    done(error, user);
  });
});