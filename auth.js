var passport = require('passport'),
facebookStrategy = require('passport-facebook'),
LocalStrategy = require('passport-local').Strategy, 
RememberMeStrategy = require('passport-remember-me').Strategy;
//Include user model
User = require('./models/User');

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

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null,user);
});

passport.use(new LocalStrategy({
        passReqToCallback : true
    },function(req, emailOrPhone, password, done){
        console.log('Passcode authentication');
        process.nextTick(function(){
                var searchQuery = {};
                if(req.body.email)
                    searchQuery.email = emailOrPhone;
                else if(req.body.phone)
                    searchQuery.phone = emailOrPhone;
                else{
                    done(true, 'Invalid request');
                    return;
                }
                User.findOne(searchQuery,function(err, user){
                    if(err){
                        console.log('Error while loggin in : ' + err);
                        done(err);
                        return;
                    }
                    if(!user){
                        //Handle existing user
                        User.add({
                            email : emailOrPhone,
                            phone : emailOrPhone,
                            first_name : req.body.firstname,
                            last_name : req.body.lastname
                        },function(error, user){
                            if(error){
                                console.log('Error while registering new user', error);
                                done(error);
                                return;
                            }
                            user.sendVerification();
                            done(false,user);
                        });
                    } else{
                        user.sendVerification();
                        done(false,user);
                    }
                });
            });
    })
);
