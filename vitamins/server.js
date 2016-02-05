// ---------------------------------------------------------------------------------
// Server using express
var express = require('express');
var doT = require('express-dot');
var app = express();
var bodyParser = require('body-parser');

// Connection to database
pgp = require('pg-promise')(/*options*/);
var db = pgp("postgres:///vitamins");
// Import file with angular logic
// var ang = require('./angular_info.js');

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// app.use(express.static('public'));
// Tell app that the views are located in the /views folder, 
// then we tell it to use the ‘dot’ templating engine, 
// and tell it that the extension for our views is ‘html’
app.set('views', __dirname+'/views');
app.set('view engine', 'dot');
app.engine('html', doT.__express);
app.use('/css',express.static(__dirname+'/public/css'));
app.use('/img',express.static(__dirname+'/public/img'));
app.use('/js',express.static(__dirname+'/public/js'));

// Get handler
app.get('/', function (req, res){
db.query("SELECT * from vitamins")
    .then(function (data) {
        var templateData = {"title":"Vitamins", "vitamins":data};
        res.render('index.html', templateData, function(err, html) {
          res.send(html);
        });
    })
    .catch(function (error) {
        console.log("ERROR:", error);
    });
});

// Post handler for form submission
app.post('/process_post', urlencodedParser, function (req, res) {

   // Prepare output in JSON format
   response = {
       first_name:req.body.first_name,
       last_name:req.body.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
});




