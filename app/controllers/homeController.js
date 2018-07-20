const router = require('express').Router();
const productModel = require('../models/productModel');
router.get('/', (req, res) => {
	let query = req.query.pageType;
	let type;
	if(!query || query === 'topview'){
		type = 'views';
	}
	else if(query === 'topnew'){
		type = 'createdDate';
	}

	else if(query === 'topseller'){
		type = 'soldQuantity'
	}

	let p1 = productModel.loadTop10Product(type);
	let p2 = productModel.loadTop3Product('views');
	let p3 = productModel.loadTop3Product('createdDate');
	let p4 = productModel.loadTop3Product('soldQuantity');

	Promise.all([p1,p2,p3,p4]).then(([top10pro,top3View,top3New,top3Seller])=>{
		for(let i = 0; i<top10pro.length;i++){
			top10pro[i]['imageAvatar'] = top10pro[i].ImagesPath.split(';')[0];
		}
		for(let i = 0; i<top3New.length;i++){
			top3New[i]['imageAvatar'] = top3New[i].ImagesPath.split(';')[0];
		}
		for(let i = 0; i<top3View.length;i++){
			top3View[i]['imageAvatar'] = top3View[i].ImagesPath.split(';')[0];
		}
		for(let i = 0; i<top3Seller.length;i++){
			top3Seller[i]['imageAvatar'] = top3Seller[i].ImagesPath.split(';')[0];
		}
		let vm = {
			products: top10pro,
			top3View: top3View,
			top3New:top3New,
			top3Seller:top3Seller
		}
		res.render('index',vm);
	})
});

module.exports = router;