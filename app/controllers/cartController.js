const router = require('express').Router();
const Cart = require('../models/Cart');
const productModel = require('../models/productModel')


router.get('/shopping-cart', (req, res) => {
	if (!req.session.cart)
		return res.render('shopping-cart', {products: null})
	let cart = new Cart(req.session.cart);
	let products = cart.generateArray();
	// console.log('product-cart');
	// console.log(products);
	res.render('shopping-cart', {products: products, totalPrice: cart.totalPrice});

});



router.post('/addcart/:id', (req, res) => {
	let qty = req.params.qty || 1
	let productId = parseInt(req.params.id);
	let cart = new Cart(req.session.cart? req.session.cart : {});
	productModel.fetchSingle(productId)
	.then(product => {
		if (cart.checkAlreadyIn(product[0].id.toString()))
		{
			console.log("PRODUCT ALREADY IN CART")
			req.session.cart = cart;
			return res.status(200).json({success: false, msg: 'Alrealdy In cart',cart:req.session.cart})
		}
		cart.add(product[0], product[0].id.toString());
		req.session.cart = cart;
		//req.flash('success_msg', 'added to your art');
		console.log('REQUEST ADD TO CART PRODUCT WITH ID: ' + productId);
		console.log("Cart nè");
		console.log(req.session);
		//res.redirect('/');
		res.status(200).json({success: true, msg: 'added to cart',cart:req.session.cart})
	})
	.catch(err => {
		//res.json({success: false, msg: 'failed to cart'})
		res.json(err);
		//res.redirect('/');
		console.log(err);
	})


});

router.get('/reduce/:id', (req, res) => {
	let productId = req.params.id;
	let cart = new Cart(req.session.cart? req.session.cart : {});
	cart.reduceByOne(productId);
	req.session.cart = cart;
	res.redirect('/');
});

router.post('/remove/:id', (req, res) => {
	let productId = parseInt(req.params.id);
	let cart = new Cart(req.session.cart? req.session.cart : {});
	// console.log(productId.toString());
	cart.removeItem(productId.toString());
	req.session.cart = cart;
	// res.redirect('/');
	res.json({success: true, msg: 'sucess to remove item out cart'});
});


router.get('checkout', (req, res) => {
	if (!req.session.cart)
		return res.redirect('/shopping-cart');
	let cart = new Cart(req.session.cart);
	res.render('checkout', {total: cart.totalPrice, })
});

// router.post('checkout',ensureAuthenticated, (req, res) => {
// 	if (!req.session.cart)
// 		return res.redirect('/shopping-cart');

// 	let cart = new Cart(req.session.cart);

// 	var stripe = require("stripe")("");
// 	stripe.charges.create({
// 		amount: cart.totalPrice,
// 		currency: "USD",
// 		source: "tok_mastercard",
// 		description: "Test change",

// 	}. (err, charges) => {
// 		if (err)
// 			return res.redirect('/checkout');

// 		let order = new Object({
// 			user: req.user,
// 			cart: cart,
// 			address: req.body.address,
// 			name: req.body.name,
// 			paymentId: charge.id
// 		});

// 		orderController.add(order)
// 		.then(() => {
// 			 req.session.cart=null;
//    			 res.redirect('/');
// 		})
// 		.catch(err => {

			
// 		});
// 	});
// });

// Access Control
// function ensureAuthenticated(req, res, next){
//   if(req.isAuthenticated()){
//     return next();
//   } else {
//     req.flash('danger', 'Please login');
//     res.redirect('/users/login');
//   }
// }

router.get('/cart', (req, res) => {
	res.render('cart');
});

router.post('/updateCart', (req, res) => {
	let idsStr = req.query.ids;
	let qtiesStr = req.query.qties;
	// console.log(qtiesStr);
	let idsArr = idsStr.split(',');
	let qtiesArr = qtiesStr.split(',');
	// console.log(idsArr);
	// console.log(qtiesStr);
	let cart = new Cart(req.session.cart? req.session.cart : {});
	cart.updateCart(idsArr, qtiesArr);
	req.session.cart = cart;
	res.json({});
});


module.exports = router;