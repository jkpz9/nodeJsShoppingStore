'use strict'
const router = require('express').Router();
const productModel = require('../models/productModel');
const config = require('../../config/config.js');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const ensureHasRole = require('../middlewares/ensureHasRole');
const categoryModel = require('../models/categoryModel');
const manufacturerModel = require('../models/manufacturerModel');
const { check, validationResult } = require('express-validator/check');
const validator = require('validator');

const multiparty = require('multiparty');

function renderShop(lPro,nPro,page,pageName,paramName,res){
	Promise.all([lPro, nPro]).then(([lProducts, nProduct]) => {
		for(let i = 0; i<lProducts.length;i++){
			lProducts[i]['imageAvatar'] = lProducts[i].ImagesPath.split(';')[0];
		}
		let totalProduct = nProduct[0].total;
		let numberPages = Math.ceil(totalProduct / config.PRODUCTS_PER_PAGE);
		let numbers = [];
		for (let i = 1; i <= numberPages; i++) {
			numbers.push({
				value: i,
				isCurPage: i === +page
			});
		}

		let vm = {
			products: lProducts,
			noProducts: lProducts.length === 0,
			page_numbers: numbers,
			nPages: numberPages,
			pageName: pageName,
			paramName: paramName
		};
		res.render('shop', vm);
	})
}


router.get('/shop', (req, res) => {
	let pageName = 'shop';
	let paramName = '';
	let page = req.query.page || 1;
	let offset = (page - 1) * config.PRODUCTS_PER_PAGE;
	let p1 = productModel.loadAllProduct(offset);
	let p2 = productModel.countProduct();
	renderShop(p1,p2,page,pageName,paramName,res);

});

router.get('/single-product/:id', (req, res) => {
	let id = req.params.id;
	productModel.single(id).then((rows) => {
		// console.log(rows);
		let lProducts = rows;
		let lImages = lProducts.ImagesPath.split(';');
		let images = [{
			id : 0,
			imagePath : lProducts.ImagesPath.split(';')[0],
			isAvatar : true
		}];
		for(let i = 1; i<lImages.length;i++){
			images.push({
				id : i,
				imagePath: lImages[i],
				isAvatar: false
			})
		}
		lProducts['images'] = images;
		// console.log('pro: ');
		// console.log(lProducts);
		let curView = rows.views;
		let newView = ++curView;
		let p1 = productModel.load5ProductFromTheSameManufacturer(id, rows.manufacturerId);
		let p2 = productModel.load5ProductInTheSameCategory(id, rows.categoryId);
		let p3 = productModel.updateView(id, newView);
		Promise.all([p1, p2, p3]).then(([proManufacturer, proCategory, value]) => {
			// console.log('proManufacturer');
			// console.log(proManufacturer);
			for(let i = 0; i<proManufacturer.length;i++){
				proManufacturer[i]['imageAvatar'] = proManufacturer[i].ImagesPath.split(';')[0];
			}
			for(let i = 0; i<proCategory.length;i++){
				proCategory[i]['imageAvatar'] = proCategory[i].ImagesPath.split(';')[0];
			}
			console.log(lProducts);
			let vm = {
				product: lProducts,
				proManufacturer: proManufacturer,
				proCategory: proCategory,
			}
			res.render('single-product', vm);
		})
	});
});

router.get('/search', (req, res) => {
	const keyWord = req.query.key;
	const manufacturerName = req.query.manufacturer || "All";
	const categoryName = req.query.category || "All";
	const optionPrice = req.query.price || "All";
	let maxPrice = 0;
	let minPrice = 0;
	let page = req.query.page || 1;
	let offset = (page - 1) * config.PRODUCTS_PER_PAGE;

	let search;
	let countResult;
	if (optionPrice === "LowerThan5Million") {
		minPrice = config.MIN_PRICE;
		maxPrice = 5000000-1;
	} else if (optionPrice === "From5MillionTo10Million") {
		minPrice = 5000000;
		maxPrice = 10000000;
	} else if (optionPrice === "HigherThan10Million") {
		minPrice = 10000001;
		maxPrice = config.MAX_PRICE;
	} else {
		minPrice = 0;
		maxPrice = config.MAX_PRICE;
	}

	if (manufacturerName === "All") {
		// Category And Manufacturer = All;
		if (categoryName === "All") {
			search = productModel.searchProductByPrice(keyWord, minPrice, maxPrice, offset);
			countResult = productModel.countProductSearchByPrice(keyWord, minPrice, maxPrice, offset);
			result(search, countResult);
		}
		// Search by category
		else {
			// console.log('search by category: ');
			// console.log('categoryName: ' + categoryName);
			let category = new Promise((resolve, reject) => {
				categoryModel.getCategoryByName(categoryName).then(rows => {
					resolve(rows);
					// console.log("categoryId: ");
					// console.log(rows.categoryId);
				}).catch(err => {
					reject(err);
				})
			}).then(rows => {
				search = productModel.searchProductByCategory(keyWord, rows.categoryId, minPrice, maxPrice, offset);
				countResult = productModel.countProductSearchByCategory(keyWord, rows.categoryId, minPrice, maxPrice);
				result(search, countResult);
			});

		}
	} else {
		// Search By Manufacturer
		if (categoryName === "All") {
			console.log('search by Manufacturer');
			let manufacturer = new Promise((resolve, reject) => {
				manufacturerModel.getManufacturerByName(manufacturerName).then((rows) => {
					// console.log('manufacturer: ');
					// console.log(rows);
					resolve(rows);
				}).catch(err => {
					reject(err);
				})
			}).then(manufacturer => {
				search = productModel.searchProductByManufacturer(keyWord, manufacturer.manufacturerId, minPrice, maxPrice, offset);
				countResult = productModel.countProductSearchByManufacturer(keyWord, manufacturer.manufacturerId, minPrice, maxPrice);
				result(search, countResult);
			});
		} else {
			let category = categoryModel.getCategoryByName(categoryName);
			let manufacturer = manufacturerModel.getManufacturerByName(manufacturerName);
			Promise.all([category, manufacturer]).then(([cate, manu]) => {
				search = productModel.searchProductByCriteria(keyWord, cate.categoryId, manu.manufacturerId, minPrice, maxPrice, offset);
				countResult = productModel.countProductSearchByCriteria(keyWord, cate.categoryId, manu.manufacturerId, minPrice, maxPrice);
				result(search, countResult);
			})

		}

	}

	function result(search, countResult) {
		Promise.all([search, countResult]).then(([lProducts, nProduct]) => {
			// console.log(lProducts);
			// console.log(nProduct[0].total);
			let totalProduct = nProduct[0].total;
			let numberPages = Math.ceil(totalProduct / config.PRODUCTS_PER_PAGE);
			let numbers = [];
			for (let i = 1; i <= numberPages; i++) {
				numbers.push({
					value: i,
					isCurPage: i === +page
				});
			}

			for(let i = 0; i<lProducts.length;i++){
				lProducts[i]['imageAvatar'] = lProducts[i].ImagesPath.split(';')[0];
			}

			let query = {
				key: keyWord,
				manufacturer: manufacturerName,
				category: categoryName,
				optionPrice: optionPrice
			}
			let vm = {
				query: query,
				products: lProducts,
				noProducts: lProducts.length === 0,
				page_numbers: numbers,
				nPages: numberPages
			};

			res.render('search_result', vm);
		})
	}
});

router.get('/manufacturer/:name',(req,res)=>{
	let manufacturerName = req.params.name;
	let pageName = 'MANUFACTURER ' + manufacturerName.toUpperCase();
	let page = req.query.page || 1;
	let offset = (page - 1) * config.PRODUCTS_PER_PAGE;
	manufacturerModel.getManufacturerByName(manufacturerName).then((rows) => {
		let manufacturerId = rows.manufacturerId;
		let lPro = productModel.loadProductByManufacturer(manufacturerId, offset);
		let nPro = productModel.countProductByManufacturer(manufacturerId);
		renderShop(lPro, nPro, page, pageName, manufacturerName, res);
	});
});

router.get('/category/:name', (req, res) => {
	let categoryName = req.params.name;
	let pageName = 'CATEGORY '+ categoryName.toUpperCase();
	let page = req.query.page || 1;
	let offset = (page - 1) * config.PRODUCTS_PER_PAGE;
	categoryModel.getCategoryByName(categoryName).then((rows) => {
		let categoryId = rows.categoryId;
		let lPro = productModel.loadProductByCategory(categoryId, offset);
		let nPro = productModel.countProductByCategory(categoryId);
		renderShop(lPro, nPro, page, pageName, categoryName, res);
	});
});


// router.get('/listproduct', (req, res) => {
// 	let page = req.query.page || 1;
// 	let numberPages = productModel.
// });

module.exports = router;