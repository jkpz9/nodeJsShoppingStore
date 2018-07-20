const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const express_handlebars_sections = require('express-handlebars-sections');
const flash = require('connect-flash');
const passport = require('passport');

const util = require('./app/utils/util');
const wNumb = require('wnumb');
const port = process.env.PORT || 3000;

const app = express();

const handleLayout = require('./app/middle-wares/handleSearch');

const userController = require('./app/controllers/usersController');
const homeController = require('./app/controllers/homeController');
const aboutController = require('./app/controllers/aboutController');
const contactController = require('./app/controllers/contactController');
const productController = require('./app/controllers/productsController');
const cartController = require('./app/controllers/cartController');
const cityController = require('./app/controllers/citiesController');
const checkoutController = require('./app/controllers/checkoutController');

const orderControllerForUser = require('./app/controllers/OrderController');


/* Admin controller */
const orderController = require('./app/controllers/adminController/orderController');
const manufacturerController = require('./app/controllers/adminController/manufacturerController');
const categoryController = require('./app/controllers/adminController/categoryController');
const dashboardController = require('./app/controllers/adminController/dashboardController');
const productAdminController = require('./app/controllers/adminController/productController');
require('dotenv').config();

// set up our express application
app.use(morgan('dev')); // log every request to the console

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir:  __dirname + '/app/views/layouts/',
    helpers: {
        section: express_handlebars_sections(),
        moneyFormat: n=>{
            let moneyFormat = wNumb({
                mark: '.',
                thousand: ',', 
            });
            return moneyFormat.to(n);
        },
    }
}));

// View Engine
app.set('view engine', 'hbs');

app.use(express.static(path.resolve(__dirname, 'public')));
app.set('views', __dirname + '/app/views');

app.use(cookieParser());

app.use(expressValidator());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({ secret: 'somerandonstuffs', resave: true, saveUninitialized: true }));

// Connect Flash
app.use(flash());


require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.warning_msg = req.flash('warning_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.info_msg = req.flash('info_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.warning_msg = req.flash('encourage_msg');
  next();
});

app.use(handleLayout);
app.use(userController);
app.use(homeController);
app.use(aboutController);
app.use(contactController);
app.use(productController);
app.use(cartController);
app.use(cityController);
app.use(checkoutController);
app.use(orderController);

app.use(orderController);
app.use(manufacturerController);
app.use(categoryController);
app.use(dashboardController);
app.use(productAdminController);
app.use(orderControllerForUser);
// // catch 404 and forward to error handler
//     // note this is after all good routes and is not an error handler
//     // to get a 404, it has to fall through to this route - no error involved

//     app.use(function (req, res, next) {
//         var err = new Error('Not Found');
//         err.status = 404;
//         next(err);
//     });

//     // error handlers - these take err object.
//     // these are per request error handlers.  They have two so in dev
//     // you get a full stack trace.  In prod, first is never setup

//     // development error handler
//     // will print stacktrace

//     if (app.get('env') === 'development') {
//         app.use(function (err, req, res, next) {
//             res.status(err.status || 500);
//             res.render('error', {
//                 message: err.message,
//                 error: err,
//                 layout: false
//             });
//         });
//     }

//     // production error handler
//     // no stacktraces leaked to user
//     app.use(function (err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: {}
//         });
//     });

// app.get('/listproduct', (req, res) => {
//   res.render('admin/listproduct', { layout: 'admin' });
// })

app.listen(port, () => console.log("Running at Port " + port));
