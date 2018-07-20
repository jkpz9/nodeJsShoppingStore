const baseDAO = require('../dbUtil/baseDAO');
const config = require('../../config/config');
//const utils = require('../utils/orderNumberGenarator');

// orderby Date, status

exports.fetchAllBelongTo = (id, offset) => {
        let sql = `SELECT * FROM orders WHERE memberId = ${id} order by created_at LIMIT ${config.ORDER_PER_PAGE} offset ${offset}`;    
        return  baseDAO.load(sql);
}

exports.nCountBeLongTo = (id) => {
        let sql = `SELECT count(*) as total FROM orders WHERE memberId = ${id}`;    
        return  baseDAO.load(sql);
}

exports.add = (orderNumber, cart, discount, memberId) => {

    let order = {
        orderNumber: orderNumber,
        discount: discount || 0.0,
    };
    order.totalAmount = cart.totalPrice*(1 - order.discount);
    let sqlOrder = `INSERT INTO orders(orderId, totalAmount, discount, memberId) VALUES('${order.orderNumber}', ${order.totalAmount}, ${order.discount}, ${memberId})`;
    return baseDAO.save(sqlOrder);
}

exports.getProductDetail = (orderNumber) => {
    let sql = `select d.discount,d.productQuantity,d.totalAmount,d.price_per_unit,
               p.productName
               from orderdetails d, products p  
               where orderId = '${orderNumber}' AND d.productId = p.id`;

   return baseDAO.load(sql);
}

exports.getGenericDetail = (orderNumber) => {
    let sql = `select m.firstName, m.lastName,
	   o.orderId, o.created_at, o.discount, o.state, o.totalAmount,
       p.provinceName as province,
       c.cityName  as city,
       l.deliveryAddress
	   from orders o,
	   members m,
       deliveryaddresses l,
        cities c,
        provinces p
       where o.orderId = '${orderNumber}'
	  AND m.memberId = o.memberId
      AND l.orderId = o.orderId
      AND l.deliveryDistrict = c.cityId
      AND c.provinceId = p.provinceId;`;

   return baseDAO.load(sql);
 }

exports.single = (id) =>{
    return new Promise((resolve, reject) => {
        let sql = `select * from orders where orderId = ${id}`;
        baseDAO.load(sql).then(rows => {
            if (rows.length === 0) {
                resolve(null);
            } else {
                resolve(rows[0]);
            }
        }).catch(err => {
            reject(err);
        });
    });
}

exports.loadAllOrderDetails = (orderId,offset)=>{
    // let sql = `select * from orders limit ${config.ORDER_PER_PAGE} offset ${offset}`;
    let sql = `SELECT
    od.orderId,
    od.created_at,
    od.discount,
    od.state,
    od.totalAmount,
    mb.memberId,
    mb.firstName,
    mb.lastName,
    odt.detailId,
    odt.productQuantity,
    pr.id as productId,
    pr.productName,
    pr.price,
    dl.id AS dlAddressId,
    dl.deliveryDistrict,
    dl.deliveryAddress,
    dl.phoneNumber,
    ct.cityId,
    ct.cityName,
    pv.provinceId,
    pv.provinceName
    FROM
        orders od
    JOIN members mb ON od.memberId = mb.memberId
    JOIN orderdetails odt ON od.orderId = odt.orderId
    JOIN products pr ON odt.productId = pr.id
    JOIN deliveryaddresses dl ON dl.orderId = od.orderId
    JOIN cities ct ON dl.deliveryDistrict = ct.cityId
    JOIN provinces pv ON pv.provinceId = ct.provinceId
    WHERE od.orderId = ${orderId}
    LIMIT ${config.ORDER_PER_PAGE} offset ${offset}`
    return baseDAO.load(sql);
}

exports.countOrderDetails = (orderId)=>{
    //let sql = `select count(*) as total from orders `;
    let sql = `SELECT count(*) as total
    FROM
        orders od
    JOIN members mb ON od.memberId = mb.memberId
    JOIN orderdetails odt ON od.orderId = odt.orderId
    JOIN products pr ON odt.productId = pr.id
    JOIN deliveryaddresses dl ON dl.orderId = od.orderId
    JOIN cities ct ON dl.deliveryDistrict = ct.cityId
    JOIN provinces pv ON pv.provinceId = ct.provinceId
    WHERE od.orderId = ${orderId}`
    return baseDAO.load(sql);
}

exports.loadAllOrders = (offset)=>{
    let sql = `SELECT 
    od.orderId,
    od.created_at,
    od.discount,
    od.state,
    od.totalAmount,
    mb.memberId,
    mb.firstName,
    mb.lastName,
    dl.id AS dlAddressId,
    dl.deliveryDistrict,
    dl.deliveryAddress,
    dl.phoneNumber,
    ct.cityId,
    ct.cityName,
    pv.provinceId,
    pv.provinceName
    FROM 
        orders od
    JOIN members mb ON od.memberId = mb.memberId
    JOIN deliveryaddresses dl ON dl.orderId = od.orderId
    JOIN cities ct ON dl.deliveryDistrict = ct.cityId
    JOIN provinces pv ON pv.provinceId = ct.provinceId
    ORDER BY created_at DESC
    LIMIT ${config.ORDER_PER_PAGE} 
    OFFSET ${offset}`
    return baseDAO.load(sql);
}

exports.countOrders = ()=>{
    let sql = `SELECT count(*) as total
    FROM 
        orders od
    JOIN members mb ON od.memberId = mb.memberId
    JOIN deliveryaddresses dl ON dl.orderId = od.orderId
    JOIN cities ct ON dl.deliveryDistrict = ct.cityId
    JOIN provinces pv ON pv.provinceId = ct.provinceId`
    return baseDAO.load(sql);
}

exports.orderAndMember = (id) =>{
    return new Promise((resolve, reject) => {
        let sql = `select * from orders od, members mb where orderId = ${id} and od.memberId = mb.memberId`;
        baseDAO.load(sql).then(rows => {
            if (rows.length === 0) {
                resolve(null);
            } else {
                resolve(rows[0]);
            }
        }).catch(err => {
            reject(err);
        });
    });
}

exports.changeStateOrder = (orderId,newState)=>{
    let sql = `UPDATE orders SET state = ${newState} WHERE orderId = ${orderId}`
    return baseDAO.save(sql);
}

exports.deleteOrder = (orderId)=>{
    let sql = `DELETE FROM orders WHERE orderId = ${orderId}`;
    return baseDAO.save(sql);
}

exports.updateTotalAmount = (orderId,newTotal)=>{
    let sql = `UPDATE orders SET totalAmount = ${newTotal} WHERE orderId = ${orderId}`;
    return baseDAO.save(sql);
}