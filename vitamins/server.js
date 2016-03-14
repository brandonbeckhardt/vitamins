// *********************
//  * Module dependencies
//  *********************
express = require('express'),
    http    = require('http'),
    path    = require('path'),
    pgp = require('pg-promise')(/*options*/), // Connection to database
    expressLayouts = require('express-ejs-layouts');
    bodyParser = require('body-parser');
    var configDB = require('./config/database.js');
    var db = pgp(configDB.url);
    // For signup/login
    var passport = require('passport');
    var flash    = require('connect-flash');

    var morgan       = require('morgan');
    var cookieParser = require('cookie-parser');
    var session      = require('express-session');
var app = express();
 

/***************
 * Configuration
 ***************/
app.engine('html', require('ejs').renderFile);
app.set('port', process.env.PORT || 6654);
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
app.use(session({
 secret: 'ksdajflsdkmalskdfjldksmflska',
 resave: true,
 saveUninitialized: true
 })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

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
    }).catch(function (error) {
        console.log("ERROR:", error);
    });
});
app.get('/new_user', function(req, res){
    res.render('new_user.ejs');
});
app.get('/login', function(req, res){
    res.render('login.ejs');
});

app.post('/create_user',function(req, res){
    console.log('made it');
    
});

app.post('/confirmation',function(req, res){
    var orderData = []
    // Consider doing this logic in angular
    if (typeof req.body.vitamin_name == "string"){
            var vitamin = req.body.vitamin_name;
            var vitamin_id = req.body.vitamin_id;
            var dosage = req.body.dosage;

            var times_per_day = req.body.times_per_day;
            console.log(times_per_day);
            var price = req.body.price;
            orderData.push({'vitamin': vitamin, 'vitamin_id': vitamin_id,'dosage':dosage,'times_per_day':times_per_day, 'price':price, });
    } else {
        for(i = 0; i <  req.body.vitamin_name.length; i++){
            var vitamin = req.body.vitamin_name[i];
            var vitamin_id = req.body.vitamin_id[i];
            var dosage = req.body.dosage[i];
            var times_per_day = req.body.times_per_day[i];
            var price = req.body.price[i];
            orderData.push({'vitamin': vitamin, 'vitamin_id':vitamin_id,'dosage':dosage,'times_per_day':times_per_day, 'price':price});
        }
    }
    var total_price = req.body.total_price;

    // temp hack for user and address
    db.query('select *, addresses.id as address_id from users, addresses where users.id = user_id and users.id = 1;')
    .then(function(userAddressdata){
        if (userAddressdata.length > 1){
            userAddressdata = userAddressdata[0]
        }
        {data = {'vitamin_info':orderData, 'total_price':total_price, 'user_address_info':userAddressdata}}
        res.render('confirmation_page.ejs', data, function(err, html) {
            res.send(html);
         });
    }).catch(function (error) {
        console.log("ERROR:", error);
    });
});



app.post('/submit_order',function(req, res){
    var data = JSON.parse(req.body.order_data);
    console.log(data)
    //Build order
    var user_address_info = data["user_address_info"];

    // Create order
    order = {};
    order['user_id'] = user_address_info.user_id;
    order['address_id'] = user_address_info.address_id;
    order['price'] = data.total_price;
    value_names = ["user_id","address_id", "price"];
    valueNamesToQuery = ValueNamesToQuery(value_names);
    valuesToQuery = ValuesToQuery(value_names, order);

    create_order_query = 'insert into orders'+valueNamesToQuery+'values'+valuesToQuery+' returning id;';
    db.one(create_order_query)
    .then(function(order){
        var order_id = order.id;
        var vitamin_info = data["vitamin_info"];
        var orderDetails = [];
        for (vit_index in vitamin_info){
            var vitamin_details = {};
            var vitamin = vitamin_info[vit_index];
            vitamin_details['order_id'] = order_id;
            vitamin_details['vitamin_id'] = vitamin.vitamin_id;
            vitamin_details['dose'] = vitamin.dosage;
            vitamin_details['times_per_day'] = vitamin.times_per_day;
            orderDetails.push(vitamin_details);
        }
        var value_names = ['order_id', 'vitamin_id','dose','times_per_day'];
        var valueNamesToQuery = ValueNamesToQuery(value_names);
        var query_values = "";
        for (detail_index in orderDetails){
            detail = orderDetails[detail_index];
            query_values += ValuesToQuery(value_names, detail);
             if (detail_index < orderDetails.length - 1){
                query_values += ","
            }
        }
        create_order_details_query = 'insert into order_details'+valueNamesToQuery+'values'+query_values+';'
        console.log(create_order_details_query);
        db.query(create_order_details_query)
        .then(function(i){
            console.log(order_id)
            res.render('order_successful.ejs', {'order_id':order_id }, function(err, html) {
                res.send(html);
            }); 
        }).catch(function(error){
            // Need to delete order from orders from orders
            console.log(order_id);
            db.query('delete from orders where id=' + order_id + ";");
        });
    }).catch(function(error){

    });
});
ValueNamesToQuery = function(value_names){
    query = " ("
    for (index in value_names){
        name = value_names[index];
        query += name
        if (index < value_names.length - 1){
            query += ","
        }
    }
    return query+") "
}
 ValuesToQuery = function(value_names, values){
    query = " ("
    for (index in value_names){
        key = value_names[index];
        query += values[key]
        if (index < value_names.length - 1){
            query += ","
        }
    }
    return query+") "
 };
 // Login/Logout Info
  app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
 // route middleware to make sure a user is logged in.
 // Not used yet
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}


/**************
 * Start Server
 **************/
http.createServer(app).listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port'));
});


