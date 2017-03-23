var mongoose = require('mongoose');
/********
 * Routes
 ********/
 // app/routes.js
module.exports = function(app, passport) {
    //--------------------------------General/User---------------------------------------------------
    app.get('/', function(req, res){
        res.redirect('/custom_vitamin');
    });
    // serve index and view partials
    app.get('/custom_vitamin', function(req, res){
        var info = {data :{"title":"Vitamins", "vitamins":global.vitamins}};
        res.render('custom_vitamin_creation.ejs', info);
    });
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        // If we were at Add Address page before, redirect back to it
        if (req.session.redirect_to_add_address){
            req.session.redirect_to_add_address = false;
            res.redirect('/add_address');
        } else if ( req.session.redirect_to_cart){
            req.session.redirect_to_cart = false;
            saveCustomVitamin(req,res);
        } else{
            res.render('profile.ejs', {
                user : req.user,// get the user out of session and pass to template
                message: req.flash('profile_message')
            });
        }
    });
     app.get('/add_address', function(req,res){
        if (!loggedIn(req)){
            req.session.redirect_to_add_address = true;
            req.flash("loginMessage", "You must login before continuing.");
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

    //---------------------------------Signup/Login---------------------------------------------------
    app.get('/login', function(req, res){
        res.render('login.ejs', {message:req.flash('loginMessage')});
    });
     app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
    }));
     // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
     app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    //--------------------------------Cart/Orders------------------------------------------------
    app.get('/cart',function(req, res){
        if (!loggedIn(req)){
            req.session.redirect_to_cart = true;
            req.flash("loginMessage", "You must login to access your cart");
            res.redirect('/login');
        } else {
            var Cart_Items = require('./models/cart_item');

            Cart_Items.aggregate([
                {$match:{'user_id':new mongoose.Types.ObjectId(req.user.id)}},
                {$lookup:
                 {
                   from: "custom_vitamins",
                   localField: "custom_vitamin_id",
                   foreignField: "_id",
                   as: "custom_vitamin"
                 }}],function(err,cart_items){
                    if(err) throw err;
                    res.render('cart.ejs', {'vitamin_info': {'cart_items':cart_items,'vitamins':global.vitamins}, message:req.flash('cart_message')});
                });
        } 
    });
    // Create Custom_Vitamin
    app.post('/cart',function(req, res){
        //If not logged in, 
        if (!loggedIn(req)){
            req.session.redirect_to_cart = true;
            //If we have data to save for when logger in
            if (Object.keys(req.body).length > 0){ 
                req.session.build_vitamin_info = req.body;
            }
            req.flash("loginMessage", "You must login before continuing.");
            res.redirect('/login');
        } else {
            saveCustomVitamin(req,res);
        }
    });
    function saveCustomVitamin(req,res){
        if (req.session.build_vitamin_info){ //If coming from login with saved data
            var form_vitamin = req.session.build_vitamin_info;
            req.session.build_vitamin_info = null;
        } else if (Object.keys(req.body).length > 0){ //If coming from vit creation
            //WE MUST DO SECURITY CHECKING HERE
            var form_vitamin = req.body;
        }
        if (form_vitamin){
            // If only one vitamin, make format for inputs as array of elements instead of one element
            form_vitamin.dosage = [].concat(form_vitamin.dosage);
            form_vitamin.price = form_vitamin.price;
            form_vitamin.vitamin_id =  [].concat(form_vitamin.vitamin_id);
            Custom_Vitamin = require('./models/custom_vitamin');
            vitamin = new Custom_Vitamin();
            vitamin.number_of_pills = 0; //Need to add on page!
            vitamin.times_per_day = form_vitamin.times_per_day;
            vitamin.dosage = form_vitamin.dosage;
            vitamin.vitamin_id = form_vitamin.vitamin_id;
            vitamin.number_of_pills = form_vitamin.number_of_pills;
            vitamin.name = form_vitamin.custom_vitamin_name;

            vitamin.save(function(err,vitamin){
                if (err) throw err;
                console.log('Saved Vitamin!');
                Cart_Item = require('./models/cart_item');
                cart_item = new Cart_Item();
                cart_item.user_id = req.user._id;
                cart_item.custom_vitamin_id = vitamin._id;
                cart_item.status = 'cart';
                cart_item.save(function(err,cart_item){
                    if (err) {
                        Custom_Vitamin.remove({"_id":vitamin._id}, function(err){
                            if (err) throw err;
                            req.flash("cart_message","There has been an issue saving your vitamin.");
                            res.redirect('/cart');
                        });
                        throw err;
                    }
                    console.log('Saved cart item');
                });

                req.flash("cart_message", "Your Custom Vitamin has been added to your cart!");
                res.redirect('/cart');
            });

        } else {
            res.redirect('/cart');
        }
    }
    // Called from cart to determine what to do with information
    app.post('/handle_cart', function(req, res){
        var CartItems = require("./models/cart_item");
        if (req.body.save_for_later){
            CartItems.findOneAndUpdate({"_id":req.body.save_for_later}, {status:"save_for_later"},function(err, custom_vitamin) {
                if (err) throw err;
                req.flash("cart_message","Your custom vitamin has been saved for later");
                res.redirect('/cart');
            });
        } else if ( req.body.add_to_cart){
             CartItems.findOneAndUpdate({"_id":req.body.add_to_cart}, {status:"cart"},function(err, custom_vitamin) {
                if (err) throw err;
                req.flash("cart_message","Your custom vitamin has been added to the cart");
                res.redirect('/cart');
            });
        } else if (req.body.delete){
            CartItems.remove({"_id": req.body.delete}, function (err, count){ 
                if (err) throw err;
                req.flash("cart_message","Your custom vitamin has been removed");
                res.redirect('/cart');
            }); 
        } else if (req.body.checkout){
            res.redirect('/checkout');
        } else {
            res.redirect('/cart');
        }
    });
    app.get('/orders', function(req,res){
        if (!loggedIn(req)){
            req.flash("loginMessage", "You must login before continuing.");
            res.redirect('/login');
        } else {
            Orders = require("./models/order");
            Orders.aggregate([
                {$match:{'user_id':new mongoose.Types.ObjectId(req.user.id)}},
                //Finds multiple custom_vitamins per order, however separates orders based on custom vitamin
                {$unwind: "$custom_vitamin_ids"}, 
                {$lookup:
                 {
                   from: "custom_vitamins",
                   localField: "custom_vitamin_ids",
                   foreignField: "_id",
                   as: "custom_vitamins"
                 }},
                 // Groups the orders back together based on id, specifies what to do with each field
                 {$group: {
                    _id: '$_id',
                    status: {$first:'$status'},
                    time_ordered: {$first:'$time_ordered'},
                    price: {$first:'$price'},
                    address_id: {$first:'$address_id'},
                    user_id: {$first:'$user_id'},
                    custom_vitamins:{$push:'$custom_vitamins'} //concatenate
                }}
            ],function(err, orders){
                res.render('orders.ejs',{'info':{'orders':orders, 'vitamins':global.vitamins},message:req.flash('order_submitted_message')});
            });
        }
    });

    // -------------------------- Checkout -----------------------------------------------
    //
    app.get('/checkout', function(req,res){
         if (!loggedIn(req)){
            req.session.redirect_to_cart = true;
            req.flash("loginMessage", "You must login before continuing.");
            res.redirect('/login');
        } else {
            var Cart_Items = require('./models/cart_item');

            Cart_Items.aggregate([
                {$match:{'user_id':new mongoose.Types.ObjectId(req.user.id), 'status':'cart'}},
                {$lookup:
                 {
                   from: "custom_vitamins",
                   localField: "custom_vitamin_id",
                   foreignField: "_id",
                   as: "custom_vitamin"
                 }}
            ],function(err,cart_items){
                if(err) throw err;
                var Addresses = require('./models/address');
                Addresses.find({'user_id':req.user.id}, function(err, addresses){
                if (err) throw err;
                    console.log(cart_items);
                    res.render('checkout.ejs', {'info': {'cart_items':cart_items,'vitamins':global.vitamins, 'addresses':addresses}, message:req.flash('cart_message')});
                }); 
            });
        }   
    });
    //Note used at the moment
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
    //Used to actually submit an order.  This submits the order in the cart, then removes them from cart
    //once submitted.
    app.post('/submit_order',function(req, res){
        var data = req.body;
        var Order_Model = require('./models/order');
        var order = new Order_Model();
        order.user_id = req.user.id;
        order.address_id = data.address_id;
        order.price = Number(data.price);
        var cart_items = JSON.parse(data.cart_items);
        var cart_item_ids = [];
        order.custom_vitamin_idss = [];
        for (idx in cart_items){
            cart_item_ids.push(cart_items[idx]._id);
            order.custom_vitamin_ids.push(cart_items[idx]["custom_vitamin"][0]._id);
        }
        order.time_ordered = new Date();
        order.status = "submitted";
        //Save the order
        order.save(function(err, order){
            if (err) throw err;
            //Remove stale cart items 
            Cart_Items = require("./models/cart_item");
            Cart_Items.remove({_id:{$in:cart_item_ids}}, function (error, count){
                if (error) throw error;
                req.flash("order_submitted_message","Congrats! Your order has been placed");
                res.redirect("/orders");
            });
        });
    });



    //----------------- Creation of a Vitamin (user should never see this) -------------------------
    app.get('/create_vitamin', function(req, res){
        res.render('create_vitamin.ejs', {message: {success:req.flash('vitamin_created_message'), error:req.flash('auth_failed') }});
    });
    app.post('/create_vitamin', function(req, res){
        // Note there is no authentication
        form_vitamin = req.body;
        Vitamin = require("./models/vitamin");
        vitamin = new Vitamin();
        auth = form_vitamin.vitamin_creation_auth;
        if (auth == temp_authentication){
            vitamin.name = form_vitamin.name;
            vitamin.description = form_vitamin.description;
            vitamin.price_per_unit = parseFloat(form_vitamin.price_per_unit);
            vitamin.dose_range = form_vitamin.dose_range.split(',').map(parseFloat);
            vitamin.times_per_day =form_vitamin.times_per_day;
            vitamin.units = form_vitamin.units;
            vitamin.save(function(err, vitamin){
                if (err) throw err;
                Vitamin.find({}, function(err, vitamins){
                    if (err) throw err;
                    global.vitamins = vitamins;
                    console.log('Saved!');
                    req.flash("vitamin_created_message", "Vitamin Created");
                    res.redirect('/create_vitamin');
                }); 
            });
        } else {
            req.flash("auth_failed", "You did not provide the proper authentication password");
            res.redirect('/create_vitamin');
        }
    });

    //------------------------------------ Generic Functions ----------------------------
    var temp_authentication ="temp_auth_service";
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
        res.redirect('/login');
    }
    function loggedIn(req){
        return req.isAuthenticated();
    }
}