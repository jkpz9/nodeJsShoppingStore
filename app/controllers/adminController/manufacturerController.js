'use strict'
const router = require('express').Router();
const manufacturerModel = require('../../models/manufacturerModel');
const productModel = require('../../models/productModel');
const config = require('../../../config/config');
const ensureAuthenticated = require('../../middlewares/ensureAuthenticated');
const ensureHasRole = require('../../middlewares/ensureHasRole');
const {
  check,
  validationResult
} = require('express-validator/check');
const validator = require('validator');

router.get('/manufacturers_management',ensureHasRole,(req,res)=>{
    
    manufacturerModel.loadAllManufacturer().then(rows=>{
        let lManufacturer = rows;
        for(let i = 0; i < rows.length;i++){
            productModel.countProductByManufacturer(rows[i].manufacturerId).then(result=>{
                lManufacturer[i]['noProduct'] = (result[0].total === 0);
                if(i === rows.length - 1)
                {
                    let vm = {
                        layout: 'admin',
                        lManufacturer: lManufacturer,
                    }
                    res.render('admin/makers_management',vm);
                }
            })  
        }
    })
    
});

router.post('/add_manufacturer',ensureHasRole,(req,res)=>{
    let name = req.body.name.trim();
    let address = req.body.address.trim();
    let email = req.body.email.trim();
    let phone = req.body.phone.trim();
    let description = req.body.description.trim();
    manufacturerModel.addManufacturer(name,address,email,phone,description).then(value=>{
        res.redirect('/manufacturers_management');
    });
});

router.post('/edit_manufacturer',ensureHasRole,(req,res)=>{
    let id = req.body.id;
    let name = req.body.name.trim();
    let address = req.body.address.trim();
    let email = req.body.email.trim();
    let phone = req.body.phone.trim();
    let description = req.body.description.trim();
    manufacturerModel.updateManufacturer(id,name,address,email,phone,description).then(value=>{
        res.redirect('/manufacturers_management');
    })
})

router.delete('/delete_manufacturer',ensureHasRole,(req,res)=>{
    let manufacturerId = req.body.manufacturerId;
    manufacturerModel.deleteManufacturer(manufacturerId).then(value=>{
        res.status(200).send("Success");
    })
})
module.exports = router;