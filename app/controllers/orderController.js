// const router = require('express').Router();
// const orderModel = require('../models/OrderModel');

// router.get('/orthers_management/', (req, res) => {
// 	res.send('have not implemented yet');
// })

// module.exports = router;

const orderModel = require('../models/OrderModel');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const config = require('../../config/config');


const router = require('express').Router();


router.get('/bought_histories', ensureAuthenticated,(req, res) => {
	let pageName = 'bought_histories';
	let id = req.user.id;
	let page = req.query.page || 1;
    let offset = (page - 1) * config.ORDER_PER_PAGE;
	let orderPromise = orderModel.fetchAllBelongTo(id, offset);
	let nCountPromise = orderModel.nCountBeLongTo(id);

	Promise.all([orderPromise, nCountPromise])
	.then(([orders, nCount]) => {
		let totalOrder = nCount[0].total;
    	let numberPages = Math.ceil(totalOrder / config.ORDER_PER_PAGE);
    	let numbers = [];
    	for (let i = 1; i <= numberPages; i++) {
	      numbers.push({
	        value: i,
	        isCurPage: i === +page
	      });
	    }
		console.log(orders); 
		 for (let i = 0; i < orders.length; i++) {
      let date = new Date(orders[i].created_at);
      //console.log((date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear());
      let dateFormat = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      // console.log(dateFormat);
      orders[i]['dateFormat'] = dateFormat;
      let state = orders[i].state;
      if(+state === -1){
        orders[i]['stateFormat'] = 'Unconfirmed';
      }
      else if(+state === 0){
        orders[i]['stateFormat'] = 'Confirmed';
      }
      else if(+state === 1){
        orders[i]['stateFormat'] = 'Delivering'
      }
      else{
        orders[i]['stateFormat'] = 'Completed';
      }
  }
		res.render('bought_histories', { orders: orders,page_numbers: numbers,
      nPages: numberPages, pageName: pageName});
	})
	.catch((err) =>  {
		console.log(err);
		res.render('bought_histories');
	});
})

router.get('/order/:numbercode', ensureAuthenticated,(req, res) => {
	let orderNumber = req.params.numbercode;
	let productDetailpromise = orderModel.getProductDetail(orderNumber);
	let genericDetailpromise = orderModel.getGenericDetail(orderNumber);
	Promise.all([productDetailpromise, genericDetailpromise])
	 .then(([productDetail, genericDetail]) => {
	    // rows['updatedDateFormat'] = updatedDateFormat;
	 	console.log("CHI TIET SP");
	 	console.log(productDetail);
	 	console.log("CHI TIET KHAC");
	 	console.log(genericDetail);
	 	let date = new Date(genericDetail[0].created_at);
	 	let state =genericDetail[0].state;
	      if(+state === -1){
	        genericDetail[0]['stateFormat'] = 'Unconfirmed';
	      }
	      else if(+state === 0){
	        genericDetail[0]['stateFormat'] = 'Confirmed';
	      }
	      else if(+state === 1){
	        genericDetail[0]['stateFormat'] = 'Delivering'
	      }
	      else{
	        genericDetail[0]['stateFormat'] = 'Completed';
	      }
      	let dateFormat = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      	console.log("Date formated");
      
      	genericDetail[0]['dateFormat'] = dateFormat;
      	console.log(genericDetail[0]['dateFormat']);

	 	res.render('bought_details', { productDetail: productDetail,genericDetail: genericDetail[0]})
	 });
});

module.exports = router; 
