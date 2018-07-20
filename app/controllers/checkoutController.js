const router = require('express').Router();
const Cart = require('../models/Cart');
const productModel = require('../models/productModel')
const provinceModel = require('../models/provinceModel');
const  models = require('../models/userModel');
const cityModel = require('../models/cityModel');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const orderNumberGenerator = require('../utils/orderNumberGenarator');
const orderModel = require('../models/OrderModel');
const detailModel = require('../models/OrderDetail');
const { check, validationResult } = require('express-validator/check');

const  deliverAddressModel = require('../models/deliveryAddressModel');

router.get('/checkout', ensureAuthenticated, (req, res) => {
  
  let enable = '';
	if (!req.session.cart)
  { 
    enable = 'disabled';
		return res.render('checkout', {products: null, enable: enable})
  }
  let cart = new Cart(req.session.cart);
  let nproduct = Object.keys( cart.items ).length;
  if (nproduct === undefined || nproduct === 0)
    enable = 'disabled';
	let products = cart.generateArray();
	console.log(cart.items);
	console.log(products);
	let idz = req.user.id;
	console.log('CURRENR MEMBER ID: ' + idz);
  console.log(req.user);
  let provincesz;
  let thisProvinceId;
  let citiesOfThisProvince;
  models.fetchSingle(idz)
    .then(user => {
      if (!user) {
        return res.redirect('/shop');
      }
      else {
        console.log('CURRENT USER: ');
        console.log(user);
        // get province Id of the city
        cityModel.findById(user.livingTownId)
        .then(city => {
          thisProvinceId = city.provinceId;
          console.log('City: ');
          console.log(thisProvinceId);
          // get list city of  the province
        cityModel.fetchList(thisProvinceId)
        .then(cities => {
          citiesOfThisProvince = cities;
           provinceModel.fetchAll()
        .then(provinces => {
          provincesz = provinces;
          console.log('citiesOfThisProvince: ' + citiesOfThisProvince);
          console.log('thisProvinceId: ' + thisProvinceId);
          console.log('All provinces: ');
           console.log(provincesz);

           return res.render('checkout', 
           					{
           					  userz: user, 
	                          provincesz: provincesz, 
	                          thisProvinceId: thisProvinceId,
	                          citiesOfThisProvince: citiesOfThisProvince,
	                          products: products, 
	                          totalPrice: cart.totalPrice,
                            enable: enable
                        });
        })
        .catch(error => {
          provincesz = {};
        });
        })
        .catch(err => {
          citiesOfThisProvince  = {};
        })
        })
        .catch(err => {
          thisProvinceId = -1;
        })
      }
    })
    .catch(err => {
      throw(err);
    });
});


router.post('/checkout',[
        check('livingAddress', 'livingAddress is require').isLength({ min: 1 }),
        check('livingDistrict', 'livingDistrict is require').isLength({ min: 1 }),
        check('phoneNumber', 'phone number is require and only contain digits')
        .isLength({ min: 10 })
        .matches('\\d+'),
    ],(req, res) => {
       
      let enable = '';
    
    	const errors = validationResult(req);
          if (!errors.isEmpty())
          {
             enable = 'disabled';
             return res.render('checkout', {errors: errors.mapped(), enable: enable});
          }
          else {
            let cart = new Cart(req.session.cart);
            let nproduct = Object.keys( cart.items ).length;
             if (nproduct === undefined || nproduct === 0)
             enable = 'disabled';

            let orderNumber =  orderNumberGenerator();
            console.log('current cart');
            console.log(cart);
            console.log(orderNumber);
            orderModel.add( orderNumberGenerator(),cart, null, req.user.id)
             .then(order => {
              console.log('added new order');
              console.log(order);
                let addr = {
                  orderId: orderNumber,
                  phoneNumber: req.body.phoneNumber,
                  TownId: req.body.livingCity,
                  Street: req.body.lingvingAddress
                }
                let count = 0;
                let nproduct = Object.keys( cart.items ).length;
                 console.log('NPRODUCT: ' + nproduct);
                deliverAddressModel.add(addr)
                 .then(deliverAddr => {
                  for (var id in cart.items)
                  {
                    console.log('considering product: ');
                    console.log(cart.items[id]);
                    detailModel.add(orderNumber,cart.items[id].item.id, cart.items[id].item.price,cart.items[id].price, null, cart.items[id].qty)
                     .then(detail => {
                      count++;
                      console.log('COUNT: ' + count);
                      if (count >= nproduct) {
                        let countz=0;
                        for (var id in cart.items) {
                          productModel.updateQuantity(cart.items[id].item.id, cart.items[id].qty)
                          .then((product) => {
                            countz++;
                            console.log('CURRENT UPDATEQTY: ' + countz);
                            if (countz >= nproduct) {
                              req.flash('success_msg', 'pay out completed, you will receive the order ASAP');
                              req.flash('encourage_msg', 'Let continue shopping');
                              console.log('COUNT: ' + count);
                              delete req.session['cart'];

                             return res.redirect('/shop');
                            }
                          })
                          .catch(err => console.log(err));
                        }
                      }
                     })
                      .catch(err => {
                      console.log(err);
                      req.flash('error_msg', 'pay out failed while trying to add orderDetails');
                       return res.redirect('/checkout');
                     } );
                  }
                  // req.flash('success_msg', 'pay out completed, you will receive the order ASAP');
                  //     return res.redirect('/checkout');
                 });
             })
             .catch(err => {
              console.log(err);
              req.flash('error_msg', 'pay out failed');
              return res.redirect('/checkout');
             });
          }      
});

module.exports = router;