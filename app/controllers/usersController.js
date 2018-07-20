const models = require('../models/userModel');
const cityModel = require('../models/cityModel');
const provinceModel = require('../models/provinceModel');
const orderModel = require('../models/OrderModel');
const memberModel = require('../models/memberModel');
const orderDetailModel = require('../models/orderDetailModel');
const deliveryAddressModel = require('../models/deliveryAddressModel');
const router = require('express').Router();
const {
  check,
  validationResult
} = require('express-validator/check');
const bcrypt = require('bcrypt');
const request = require('request');
const passport = require('passport');

const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const ensureHasRole = require('../middlewares/ensureHasRole');
const config = require ('../../config/config.js');
// REGISTERS
router.get('/signup', (req, res) => {
  provinceModel.fetchAll().then(provinces => {
    res.render('signup', {
      provinces: provinces
    })
    console.log(provinces);
  }).catch(error => {
    res.render('signup');
    console.log(error);
  })
});

router.post('/signup', [
  check('firstName', 'firstname is require').isLength({
    min: 1
  }),

  check('lastName', 'lastname is require').isLength({
    min: 1
  }),

  check('username', 'username is require')
  .isLength({
    min: 5
  })
  .custom(value => {
    return models.isExistedUsername(value).then(user => {
      if (user)
        throw new Error('this username is already in use');
    })
  }),
  check('livingAddress', 'livingAddress is require').isLength({
    min: 1
  }),

  check('dob', 'dob is require').isLength({
    min: 1
  }),

  check('gender', 'gender is require').isLength({
    min: 1
  }),

  check('livingDistrict', 'livingDistrict is require').isLength({
    min: 1
  }),

  check('emailAddress', 'Email is invalid')
  .isEmail()
  .trim()
  .custom(value => {
    return models.isExistedUsername(value).then(user => {
      if (user)
        throw new Error('this email is already in use');
    })
  }),

  check('phoneNumber', 'phone number is require and only contain digits')
  .isLength({
    min: 10
  })
  .matches('\\d+'),

  check('password', 'password is require')
  .isLength({
    min: 5
  })
  .matches(/\d/),

  check('confirmPassword', 'password confirm is require').exists(),

  check('confirmPassword', 'passwords must be at least 5 chars long and contain one number')
  .exists()
  .custom((value, {
    req
  }) => value === req.body.password)
], (req, res) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    provinceModel.fetchAll().then(provinces => {
      res.render('signup', {
        provinces: provinces,
        errors: errors.mapped()
      })
      console.log(provinces);
    });
    console.log("VALIDATE FAILED");
    console.log(errors);
  } else {
    // g-recaptcha-response is the key that browser will generate upon form submit.
    // if its blank or null means user has not selected the captcha, so return the error.
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      return res.json({
        "responseCode": 1,
        "responseDesc": "Please select captcha"
      });
    } else {


      // Put your secret key here.
      let secretKey = "6Lcc1FkUAAAAACn2XyEAq_qISTy1jtCF2Ee3puaM";
      // req.connection.remoteAddress will provide IP address of connected user.
      let verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
      // Hitting GET request to the URL, Google will respond with success or error scenario.
      request(verificationUrl, function (error, response, body) {
        body = JSON.parse(body);
        // Success will be true or false depending upon captcha validation.
        if (body.success !== undefined && !body.success) {
          //return res.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
          const errors = ['Failed captcha verification'];
          console.log(errors);
          
          res.render('signup', {
            errors: errors
          });
        }
        //res.json({"responseCode" : 0,"responseDesc" : "Sucess"});
        else {
          let salt = bcrypt.genSaltSync(10);
          let encryptedPassword = bcrypt.hashSync(req.body.password, salt);
          let user = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            gender: req.body.gender,
            emailAddress: req.body.emailAddress,
            phoneNumber: req.body.phoneNumber,
            dob: req.body.dob,
            livingAddress: req.body.livingAddress,
            livingTownId: parseInt(req.body.livingDistrict),
            encryptedPassword: encryptedPassword
          };


          models.add(user).then(value => {
            console.log("ADD OPERATION successfully");
            req.flash('success_msg', 'You are now registered and can log in');
            res.redirect('/login');
            // res.render('signup', {errors: {}, msg: 'Your account has been created successfully!'});
            console.log('successfully');
          }).catch(err => {
            const errors = ['ADD OPERATION FAILED FOR UNKNOWN REASONS'];
            console.log(err);
            provinceModel.fetchAll().then(provinces => {
              res.render('signup', {
                provinces: provinces,
                errors: err
              })
              console.log(provinces);
            })
          });
        }
      });
    }
  }
});


// LOGIN
router.get('/login', (req, res) => {
  res.render('login', {
    title: "Login Page"
  });
});

// Login Process
router.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
    //session: false
  })(req, res, next);
});

// logout
router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/shop');
});

router.get('/profile/:id', ensureAuthenticated, (req, res) => {
  let idz = parseInt(req.params.id);
  console.log(req.user);
  if (req.user.id != idz) {
    return res.redirect('/shop');
  }
  let provincesz;
  let thisProvinceId;
  let citiesOfThisProvince;
  models.fetchSingle(idz)
    .then(user => {
      if (!user) {
        return res.redirect('/shop');
      } else {
        console.log('CURRENT USER: ' + user);
        //dobFormated
        let date = new Date(user.dob);
       let dateFormat = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
      // console.log(dateFormat);
      user.dobFormated = dateFormat;
        // get province Id of the city
        cityModel.findById(user.livingTownId)
          .then(city => {
            thisProvinceId = city.provinceId;
            console.log('City: ' + city);
            // get list city of  the province
            cityModel.fetchList(thisProvinceId)
              .then(cities => {
                citiesOfThisProvince = cities;
                provinceModel.fetchAll()
                  .then(provinces => {
                    provincesz = provinces
                    console.log('citiesOfThisProvince: ' + citiesOfThisProvince);
                    console.log('thisProvinceId: ' + thisProvinceId);
                    console.log('All provinces: ' + provinces);
                    return res.render('profile', {
                      userz: user,
                      provincesz: provincesz,
                      thisProvinceId: thisProvinceId,
                      citiesOfThisProvince: citiesOfThisProvince
                    });
                  })
                  .catch(error => {
                    provincesz = {};
                  });
              })
              .catch(err => {
                citiesOfThisProvince = {};
              })
          })
          .catch(err => {
            thisProvinceId = -1;
          })
      }
    })
    .catch(err => {
      throw (err);
    });
});

router.post('/profile', (req, res) => {
  //
});



// change password
// change password
router.post('/changepassword/:id',[
        check('old_password', 'old_password is require').isLength({ min: 1 }),
        check('new_password', 'password is require')
        .isLength({ min: 5 })
        .matches(/\d/),
        check('confirm_new_password', 'password confirm is require').exists(),
        check('confirm_new_password', 'passwords must be at least 5 chars long and contain one number')
        .exists()
        .custom((value, { req }) => value === req.body.new_password)
        ], (req, res) => {
          const errors = validationResult(req);
          let id = parseInt(req.params.id);
          //{errors: errors.mapped()}
          if (!errors.isEmpty()) {
            console.log(errors.mapped());
            req.flash('error_msg', 'Please filled all require fields');
            res.redirect(`../profile/${req.user.id}`);
            console.log("VALIDATE FAILED");
            console.log(errors);
          }
          else {
            console.log('ID: ' + id);
            console.log("REQ.USER");
            console.log(req.user);
            if (req.user.id != id) {
                  req.flash('error_msg', 'Something wrong, you are unable to change your password');
                  return res.redirect(`../profile/${req.user.id}`);
            }
            else {
              models.findById(id)
              .then(user => {
                if (!user) {
                   req.flash('error_msg', 'the user doesnt exist, you are unable to change your password');
                  res.redirect(`../profile/${req.user.id}`);
                 }
                 let salt = bcrypt.genSaltSync(10);
                 console.log(salt);
                 let old_password = req.body.old_password;
                 //  let encryptedOldPassword = bcrypt.hashSync(old_password,salt);
                  bcrypt.compare(old_password, user.encryptedPassword, function(err, isMatch){
                    if(!isMatch) {
                      req.flash('error_msg', 'Couldnt confirm your old password, you are unable to change your password');
                      return res.redirect(`../profile/${req.user.id}`);
                    }
                    else {
                      let salt = bcrypt.genSaltSync(10);
                     let encryptedPassword = bcrypt.hashSync(req.body.new_password,salt);
                      models.changePassword(encryptedPassword, id)
                      .then(user => {
                        req.flash('success_msg', 'your password has been updated');
                        req.logout();
                        req.flash('info_msg', 'you need to re-login to access some authenticated pages');
                        res.redirect('/shop');
                        //return res.redirect(`../profile/${req.user.id}`);
                      })
                      .catch(err => {
                        console.log('INNER ERR');
                        console.log(err);
                         req.flash('error_msg', 'Catch inner exception, you are unable to change your password');
                         res.redirect(`../profile/${req.user.id}`);
                      })
                    }
                  });
              })
              .catch(err => {
                console.log('OUTER ERR');
                console.log(err);
                req.flash('error_msg', 'Catch outer exception, you are unable to change your password');
                 res.redirect(`../profile/${req.user.id}`);
              })
            }
          }
        
  });


router.post('/changeprofile/:id', [
  check('livingAddress', 'livingAddress is require').isLength({
    min: 1
  }),
  check('livingDistrict', 'livingDistrict is require').isLength({
    min: 1
  }),
  check('phoneNumber', 'phone number is require and only contain digits')
  .isLength({
    min: 10
  })
  .matches('\\d+')
], (req, res) => {
  const errors = validationResult(req);
  let id = parseInt(req.params.id);
  if (req.user.id != id) {
    return res.redirect(`../profile/${req.user.id}`);
  }
  if (!errors.isEmpty()) {
    req.flash('error_msg', 'Something wrent wrong');
    console.log("VALIDATE FAILED");
    console.log(errors);
    return res.redirect(`../profile/${req.user.id}`);
  } else {
    let options = {
      livingAddress: req.body.livingAddress,
      livingDistrict: parseInt(req.body.livingDistrict),
      phoneNumber: req.body.phoneNumber
    };

    models.updateProfile(options, id)
      .then(user => {
        req.flash('success_msg', 'your profile has been updated');
        return res.redirect(`../profile/${req.user.id}`);
      })
      .catch(err => {
        console.log('ERR');
        console.log(err);
        req.flash('error_msg', 'Catch exception');
        return res.redirect(`../profile/${req.user.id}`);
      });

  }
});

module.exports = router;