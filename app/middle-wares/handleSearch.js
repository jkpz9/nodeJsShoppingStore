const manufacturerModel = require('../models/manufacturerModel');
const categoryModel = require('../models/categoryModel');
module.exports = (req,res,next)=>{
    // console.log('session test');
    // console.log(req.session.cart);
    let cartInfo;
    if(req.session.cart){
        cartInfo = {
            cart: true,
            totalQty: req.session.cart.totalQty,
            totalPrice: req.session.cart.totalPrice,
        }
    }
    else{
        cartInfo = {
            cart:false,
        }
    }
    // console.log(cartInfo);
    let p1 = manufacturerModel.loadAllManufacturer();
    let p2 = categoryModel.loadAllCategory();
    Promise.all([p1,p2]).then(([lManufacturers,lCategory])=>{
        res.locals.layoutVM = {
            cartInfo: cartInfo,
            manufacturer: lManufacturers,
            category: lCategory,
        };
        next();
    });
}