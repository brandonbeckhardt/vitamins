// *********************
//  * Module dependencies
//  *********************
var express = require('express');
var app = express();
var http    = require('http');
var path    = require('path');
var mongoose = require('mongoose');
// For signup/login
var passport = require('passport');
var flash    = require('connect-flash');
var bodyParser = require('body-parser');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var configDB = require('./config/database.js');

var expressLayouts = require('express-ejs-layouts');

/***************
 * Configuration
 ***************/
mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration

app.engine('html', require('ejs').renderFile);
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use('/css',express.static(__dirname+'/app/css'));
app.use('/img',express.static(__dirname+'/app/img'));
app.use('/js',express.static(__dirname+'/app/js'));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'app')));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// For signup/login
// required for passport
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.use(session({
 secret: 'ksdajflsdkmalskdfjldksmflska',
 resave: true,
 saveUninitialized: true
 })); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(function (req, res, next) {
   res.locals = {
     currentUser: req.user
   };
   next();
});

// Routes
var routes = require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


global.arrayToMap = function(arr){
	var result = arr.reduce(function(map, obj) {
    	map[obj.id] = obj;
    	return map;
	}, {});
	return result;
}
// Making global vitamins
vitamin = require("./app/models/vitamin");
vitamin.find({}, function(err, vitamins) {
	// global.vitamins = global.arrayToMap(vitamins);  //currently commented out
		global.vitamins = vitamins;
});
/**************
 * Start Server
 **************/
http.createServer(app).listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});


