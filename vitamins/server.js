// *********************
//  * Module dependencies
//  *********************
express = require('express'),
    http    = require('http'),
    path    = require('path'),
    pgp = require('pg-promise')(/*options*/), // Connection to database
    db = pgp("postgres:///vitamins"),
    expressLayouts = require('express-ejs-layouts');
 
var app = express();
 

/***************
 * Configuration
 ***************/
app.engine('html', require('ejs').renderFile);
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use('/css',express.static(__dirname+'/public/css'));
app.use('/img',express.static(__dirname+'/public/img'));
app.use('/js',express.static(__dirname+'/public/js'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

/********
 * Routes
 ********/
// serve index and view partials
app.get('/', function(req, res){
  db.query("select * from vitamins, dosages where vitamins.id = v_id;")
    .then(function (data) {
        var templateData = {"title":"Vitamins", "vitamins":data};
        res.render('index.ejs', templateData, function(err, html) {
          res.send(html);
        });
    })
    .catch(function (error) {
        console.log("ERROR:", error);
    });
});

/**************
 * Start Server
 **************/
http.createServer(app).listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});