var mongoose = require('mongoose');
/********
 * Routes
 ********/
 // app/routes.js
module.exports = function(app, passport) {

// serve index and view partials
app.get('/', function(req, res){
    var Vitamin = require("./models/vitamin");
    Vitamin.find({}, function(err, vitamins) {
        var build_vitamin_info = null;
        if (req.session.build_vitamin_info){
            build_vitamin_info = req.session.build_vitamin_info;
            req.session.build_vitamin_info = null;
        }
        var info = {data :{"title":"Vitamins", "vitamins":vitamins, "build_vitamin_info": build_vitamin_info}};
        res.render('index.ejs', info);
    });
});
app.get('/login', function(req, res){
    res.render('login.ejs', {message:req.flash()});
});
//  app.post('/login', passport.authenticate('local-login', {
//         successRedirect : '/profile', // redirect to the secure profile section
//         failureRedirect : '/login', // redirect back to the signup page if there is an error
//         failureFlash : '' // allow flash messages
//     }));

//  // process the signup form
// app.post('/signup', passport.authenticate('local-signup', {
//         successRedirect : '/profile', // redirect to the secure profile section
//         failureRedirect : '/signup', // redirect back to the signup page if there is an error
//         failureFlash : true // allow flash messages
//     }));
 app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
});
 app.get('/add_address', function(req,res){
    if (!req.user){
        req.session.redirect_to_add_address = true;
        req.flash("login_first", "You must login before continuing.");
        res.redirect('/login');
    } else {
        if (req.query.redirect_to_checkout) req.session.redirect_to_checkout = true;
        res.render('add_address.ejs');
    }
 });

app.post('/add_address', function(req,res){
    form_address = req.body;
    Address = require("./models/address");
    address = new Address();
    address.street = form_address.street;
    address.country = form_address.country;
    address.state = form_address.state;
    address.zip_code = form_address.zip_code;
    address.city = form_address.city;
    address.user_id = req.user.id;
    address.save(function(err,address){
        if (err) throw err;
        console.log('Saved!');
        req.flash("profile_message", "Address Added!");
        if(req.session.redirect_to_checkout){
            req.session.redirect_to_checkout = false;
            res.redirect('/checkout');
        } else{
            res.redirect('/profile');
        }
        
    });
});

app.get('/cart', function(req, res){
     if (!req.user){
        req.session.redirect_to_cart = true;
        req.flash("login_first", "You must login before continuing.");
        res.redirect('/login');
    } else {
        var Custom_Vitamins = require('./models/custom_vitamin');
        Custom_Vitamins.find({'user_id':req.user.id},function(err, custom_vitamins){
            var Vitamins = require('./models/vitamin');
            Vitamins.find(function(err, vitamins){
                if (err) throw err;
                var vitamin_map = {};
                vitamins.forEach(function(vitamin){
                    vitamin_map[vitamin._id] = vitamin.name;
                });
                 res.render('cart.ejs', {'vitamin_info': {'custom_vitamins':custom_vitamins,'vitamin_map':vitamin_map}, message:req.flash('cart_message')});
                })
            });
    }    
});

// Create Custom_Vitamin
app.post('/add_to_cart',function(req, res){

    // If only one vitamin, make format for inputs as array of elements instead of one element
    var form_vitamin = req.body;
    form_vitamin.dosage = [].concat(form_vitamin.dosage);
    form_vitamin.price = [].concat(form_vitamin.price);
    form_vitamin.vitamin_id =  [].concat(form_vitamin.vitamin_id);
    if (!req.user){
        req.session.redirect_to_build_vitamin = true;
        req.session.build_vitamin_info = form_vitamin;
        req.flash("login_first", "You must login before continuing.");
        res.redirect('/login');
    } else {
        Custom_Vitamin = require('./models/custom_vitamin');
        vitamin = new Custom_Vitamin();
        vitamin.number_of_pills = 0; //Need to add on page!
        vitamin.times_per_day = form_vitamin.times_per_day;
        vitamin.dosage = form_vitamin.dosage;
        vitamin.vitamin_id = form_vitamin.vitamin_id;
        vitamin.price = form_vitamin.price;
        vitamin.number_of_pills = form_vitamin.number_of_pills;
        vitamin.user_id = req.user._id;
        vitamin.status = "cart";
        vitamin.price = form_vitamin.total_price;
        vitamin.save(function(err,vitamin){
            if (err) throw err;
            console.log('Saved!');
            req.flash("cart_message", "Your Custom Vitamin has been added to your cart!");
            res.redirect('/cart');
        });
    }
});

app.post('/handle_cart', function(req, res){
    var CustomVitamins = require("./models/custom_vitamin");
    if (req.body.save_for_later || req.body.add_to_cart){
        if (req.body.save_for_later){
            var custom_vitamin_id = req.body.save_for_later;
        } else {
            var custom_vitamin_id = req.body.add_to_cart;
        }
        CustomVitamins.findOne({"_id":custom_vitamin_id}, function(err, custom_vitamin) {
            if (err) throw err;
            if (req.body.save_for_later){
                custom_vitamin.status="save_for_later";
            } else {
                custom_vitamin.status="cart";
            }
            custom_vitamin.save(function(err, custom_vitamin){
                if (req.body.save_for_later){
                    req.flash("cart_message","Your custom vitamin has been saved for later");
                } else {
                    req.flash("cart_message","Your custom vitamin has been added to the cart");
                }
                res.redirect('/cart');
            });
        });
    } else if (req.body.delete){
        CustomVitamins.remove({"_id":req.body.delete}, function(err){
            if (err) throw err;
            req.flash("cart_message","Your custom vitamin has been removed.");
            res.redirect('/cart');
        });
    } else if (req.body.checkout){
        res.redirect('/checkout');
    } else {
        res.redirect('/cart');
    }
});

app.get('/checkout', function(req,res){
     if (!req.user){
        req.session.redirect_to_cart = true;
        req.flash("login_first", "You must login before continuing.");
        res.redirect('/login');
    } else {
        var Custom_Vitamins = require('./models/custom_vitamin');
        Custom_Vitamins.find({'user_id':req.user.id, 'status':'cart'},function(err, custom_vitamins){
            var Vitamins = require('./models/vitamin');
            Vitamins.find(function(err, vitamins){
                if (err) throw err;
                var vitamin_map = {};
                vitamins.forEach(function(vitamin){
                    vitamin_map[vitamin._id] = vitamin.name;
                });
                var Addresses = require('./models/address');
                Addresses.find({'user_id':req.user.id}, function(err, addresses){
                    if (err) throw err;
                    console.log({'info': {'custom_vitamins':custom_vitamins,'vitamin_map':vitamin_map, 'addresses':addresses}, message:req.flash('checkout_message')});
                    res.render('checkout.ejs', {'info': {'custom_vitamins':custom_vitamins,'vitamin_map':vitamin_map, 'addresses':addresses}, message:req.flash('checkout_message')});
                });     
            });
        });
    }   
});

app.get('/create_vitamin', function(req, res){
    res.render('create_vitamin.ejs', {message: req.flash('vitamin_created_message') });
});
app.post('/create_vitamin', function(req, res){
    // Note there is no authentication
    form_vitamin = req.body;
    Vitamin = require("./models/vitamin");
    vitamin = new Vitamin();
    vitamin.name = form_vitamin.name;
    vitamin.description = form_vitamin.description;
    vitamin.price_per_unit = parseFloat(form_vitamin.price_per_unit);
    vitamin.dose_range = form_vitamin.dose_range.split(',').map(parseFloat);
    vitamin.times_per_day =form_vitamin.times_per_day;
    vitamin.units = form_vitamin.units;
    vitamin.save(function(err, vitamin){
        if (err) throw err;
        console.log('Saved!');
        req.flash("vitamin_created_message", "Vitamin Created");
        res.redirect('/create_vitamin');
    });
   
});

 // =====================================
// PROFILE SECTION =====================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
app.get('/profile', isLoggedIn, function(req, res) {
    // If we were at Add Address page before, redirect back to it
    if (req.session.redirect_to_add_address){
        req.session.redirect_to_add_address = false;
        res.redirect('/add_address');
    } else if(req.session.redirect_to_build_vitamin)  { 
        req.session.redirect_to_build_vitamin = false;
        res.redirect('/');
    } else if ( req.session.redirect_to_cart){
        req.session.redirect_to_cart = false;
        res.redirect('/cart');
    } else{
        res.render('profile.ejs', {
            user : req.user,// get the user out of session and pass to template
            message: req.flash('profile_message')
        });
    }
});

app.post('/confirmation',function(req, res){
    var orderData = []
    // Consider doing this logic in angular
    if (typeof req.body.vitamin_name == "string"){
            var vitamin = req.body.vitamin_name;
            var vitamin_id = req.body.vitamin_id;
            var dosage = req.body.dosage;
            var times_per_day = req.body.times_per_day;
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

    // Need to get user and address. Have to add address into table
        {data = {'vitamin_info':orderData, 'total_price':total_price, 'user_address_info':null}}
        res.render('confirmation_page.ejs', data, function(err, html) {
            res.send(html);
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

}