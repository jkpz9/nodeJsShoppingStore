var baseDAO = require('../dbUtil/baseDAO');

//ppu : price per unit
// ttp: total price
exports.add = (orderNumber,productId, ppu, ttp,discount, qty) => {

    let detail = {
        orderNumber: orderNumber,
        productId: productId,
        discount: discount || 0.0,
        ppu: ppu,
        qty: qty
    };
    detail.totalAmount = ppu*(1-detail.discount)*qty;
    let sqlDetails = `INSERT INTO orderDetails(orderId, productId, totalAmount, discount, price_per_unit,productQuantity) VALUES('${detail.orderNumber}', ${detail.productId}, ${detail.totalAmount}, ${detail.discount}, ${detail.ppu}, ${detail.qty})`;
    console.log(sqlDetails);
    return baseDAO.save(sqlDetails);
}

