'use strict'
const router = require('express').Router();
const categoryModel = require('../../models/categoryModel');
const productModel = require('../../models/productModel');
const config = require('../../../config/config');
const ensureAuthenticated = require('../../middlewares/ensureAuthenticated');
const ensureHasRole = require('../../middlewares/ensureHasRole');
const {
  check,
  validationResult
} = require('express-validator/check');
const validator = require('validator');

router.get('/categories_management',ensureHasRole,(req,res)=>{
    
    categoryModel.loadAllCategory().then(rows=>{
        let lCategory = rows;
        for(let i = 0; i < rows.length;i++){
            productModel.countProductByCategory(rows[i].categoryId).then(result=>{
                lCategory[i]['noProduct'] = (result[0].total === 0);
                if(i === rows.length - 1){
                    let vm = {
                        layout: 'admin',
                        lCategory: lCategory,
                    }
                    res.render('admin/categories_management',vm);
                }
            })  
        }
    })
    
});

router.post('/add_category',ensureHasRole,(req,res)=>{
    let name = req.body.name.trim();
    let description = req.body.description.trim();
    categoryModel.addCategory(name,description).then(value=>{
        res.redirect('/categories_management');
    });
});

router.post('/edit_category',ensureHasRole,(req,res)=>{
    let id = req.body.id;
    let name = req.body.name.trim();
    let description = req.body.description.trim();
    categoryModel.updateCategory(id,name,description).then(value=>{
        res.redirect('/categories_management');
    })
})

router.delete('/delete_category',ensureHasRole,(req,res)=>{
    let categoryId = req.body.categoryId;
    categoryModel.deleteCategory(categoryId).then(value=>{
        res.status(200).send("Success");
    })
})
module.exports = router;