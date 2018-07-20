'use strict'
const router = require('express').Router();
const config = require('../../../config/config');
const productModel = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');
const manufacturerModel = require('../../models/manufacturerModel');
const orderDetailModel = require('../../models/orderDetailModel');
const ensureAuthenticated = require('../../middlewares/ensureAuthenticated');
const ensureHasRole = require('../../middlewares/ensureHasRole');
const {
  check,
  validationResult
} = require('express-validator/check');
const validator = require('validator');

const multiparty = require('multiparty');

router.get('/products_management',ensureHasRole, (req, res) => {

  let page = req.query.page || 1;
  let offset = (page - 1) * config.PRODUCTS_PER_PAGE;
  let lPro = productModel.loadAllProductInfo(offset);
  let nPro = productModel.countProduct();
  Promise.all([lPro, nPro]).then(([lProducts, nProduct]) => {
    let totalProduct = nProduct[0].total;
    let numberPages = Math.ceil(totalProduct / config.PRODUCTS_PER_PAGE);
    let numbers = [];
    for (let i = 1; i <= numberPages; i++) {
      numbers.push({
        value: i,
        isCurPage: i === +page
      });
    }

    for (let i = 0; i < lProducts.length; i++) {
      lProducts[i]['imageAvatar'] = lProducts[i].ImagesPath.split(';')[0];
      orderDetailModel.countNumberOrder(lProducts[i].id).then(rows => {
        console.log(rows[0].total);
        lProducts[i]['canDelete'] = (+rows[0].total === 0);
        console.log('candelete');
        console.log(lProducts[i]);
        if (i == lProducts.length - 1) {
          let vm = {
            layout: 'admin',
            products: lProducts,
            noProducts: lProducts.length === 0,
            page_numbers: numbers,
            nPages: numberPages,
          };
          res.render('admin/products_management', vm);
        }
      });
    }
  })
});

router.get('/products_management/product_detail/:id',ensureHasRole, (req, res) => {
  let productId = req.params.id;
  productModel.single(productId).then(rows => {
    let updatedDate = new Date(rows.updatedDate);
    let updatedDateFormat = updatedDate.getDate() + '/' + (updatedDate.getMonth() + 1) + '/' + updatedDate.getFullYear();
    rows['updatedDateFormat'] = updatedDateFormat;

    let lImages = rows.ImagesPath.split(';');
    let images = [{
      id: 0,
      imagePath: rows.ImagesPath.split(';')[0],
      isAvatar: true
    }];
    for (let i = 1; i < lImages.length; i++) {
      images.push({
        id: i,
        imagePath: lImages[i],
        isAvatar: false
      })
    }
    rows['images'] = images;
    let p1 = categoryModel.loadAllCategory();
    let p2 = manufacturerModel.loadAllManufacturer();
    Promise.all([p1, p2]).then(([lCategory, lManufacturer]) => {
      let vm = {
        layout: 'admin',
        product: rows,
        lCategory: lCategory,
        lManufacturer: lManufacturer
      }
      res.render('admin/product_detail', vm);
    })

  });
});

router.get('/addproduct', ensureHasRole, (req, res) => {
  let categories;
  let manufacturers;
  categoryModel.loadAllCategory()
    .then(categoriesResult => {
      categories = categoriesResult;
      manufacturerModel.loadAllManufacturer()
        .then(manufacturerResult => {
          manufacturers = manufacturerResult;
          console.log('manufacturers LIST: ');
          console.log(manufacturers);
          console.log('categories LIST: ');
          console.log(categories);
          return res.render('admin/addproduct', {
            layout: 'admin',
            manufacturers: manufacturers,
            categories: categories
          });
        })
        .catch(err => {
          console.log(err);
          req.flash('error_msg', 'cannot load manufacturers infos');
          return res.render('admin/addproduct', {
            layout: 'admin'
          });
        });
    })
    .catch(err => {
      console.log(err);
      req.flash('error_msg', 'cannot load categories infos');
      res.render('admin/addproduct', {
        layout: 'admin'
      });
    });

});

router.post('/addproduct', (req, res) => {
  let errors = [];
  let product = {};
  let form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    console.log('fields');
    console.log(fields);
    if (validator.isEmpty(fields.productname[0])) errors.push('productname is require');
    if (validator.isEmpty(fields.categoryId[0])) errors.push('Category is require');
    if (validator.isEmpty(fields.manufactureId[0])) errors.push('Manufacturer is require');
    if (!validator.isNumeric(fields.price[0])) errors.push('Price is invalid');
    if (!validator.isNumeric(fields.qty[0])) errors.push('Quantity is invalid');
    if (validator.isEmpty(fields.description[0])) errors.push('description is require');
    if (errors.length > 0)
      return res.render('admin/addproduct', {
        layout: 'admin',
        errors: errors
      });
    product.productname = fields.productname[0];
    product.categoryId = parseInt(fields.categoryId[0]);
    product.manufacturerId = parseInt(fields.manufactureId[0]);
    product.price = parseInt(fields.price[0]);
    product.description = fields.description[0];
    product.qty = parseInt(fields.qty[0]);
    let imgArray = files.images;
    let list = '';
    for (let i = 0; i < imgArray.length; i++) {
      //var newPath = '/uploads/'+fields.imgName+'/';
      let newPath = './public/uploads/';
      let singleImg = imgArray[i];
      newPath += singleImg.originalFilename;
      //list+= (newPath + ";");
      list += (singleImg.originalFilename + ";");
      require('../../utils/readAndWriteFile')(singleImg, newPath);
    }

    product.Images = list.slice(0, -1);
    //res.send("File uploaded to:<br\>" + list.slice(0, -1));
    console.log('PRODUCT PREparE TO INSET');
    console.log(product);
    productModel.add(product.productname, product.categoryId, product.manufacturerId, product.qty, product.Images, product.price, product.description)
      .then((anew) => {
        console.log("INSERTED NEW ITEMS");
        req.flash('success_msg', 'added new arrival product');
        return res.render('admin/addproduct', {
          layout: 'admin'
        });
      })
      .catch((err) => {
        console.log(err);
        req.flash('error_msg', 'something goes wrong while trying to process');
        return res.render('admin/addproduct', {
          layout: 'admin'
        });
      })
  });
});

router.delete('/delete_product',ensureHasRole, (req, res) => {
  let id = req.body.id;
  productModel.deleteProduct(id).then(value => {
    res.status(200).send("success");
  })
})
module.exports = router;