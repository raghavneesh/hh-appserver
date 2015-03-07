var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');

//Get appliation configuration
var applicationConfig = require('./conf/appconf').conf;
//Initialize connection with database
mongoose.connect(
    'mongodb://' + applicationConfig.db.host 
    + ":" + applicationConfig.db.port
    + "/" + applicationConfig.db.name
    ,{
        mongos : true
    });

global.Event = {
    startDate : applicationConfig.event.startDate,
    endDate : applicationConfig.event.endDate
};
global.isAuthenticated = ensureAuthenticated;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//require Passport 
var passport = require('passport');
require('./auth.js')(passport);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
//Initialise application session
app.use(session({ 
    secret: 'hillhacks' ,
    maxAge: 3600000
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('remember-me'));


app.use(function(req, res, next){
    res.locals.authenticated = req.isAuthenticated();
    if(req.session.passport && req.session.passport.user){
        res.locals.user = req.session.passport.user;
    }
    next();
});


app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        /*res.render('error', {
            message: err.message,
            error: err
        });*/
        res.send({
            error : err,
            message : err.message
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        error : err,
        message : err.message
    });
    /*res.render('error', {
        message: err.message,
        error: {}
    });*/
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.status(403);
  res.json({
    error : 'User not logged in'
  });
}
module.exports = app;
