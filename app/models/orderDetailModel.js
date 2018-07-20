const dbDAO = require('../dbUtil/baseDAO.js');

exports.single = (id) =>{
    return new Promise((resolve, reject) => {
        let sql = `select * from orderdetails where detailId = ${id}`;
        dbDAO.load(sql).then(rows => {
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

exports.loadAllDetailByOrderId = (orderId)=>{
    let sql = `SELECT * FROM orderdetails odt, products pr WHERE odt.orderId = ${orderId} AND odt.productId = pr.id`;
    return dbDAO.load(sql);
}

exports.deleteAllOrderDetailByOrderId = (orderId)=>{
    let sql = `DELETE FROM orderdetails WHERE orderId = ${orderId}`;
    return dbDAO.save(sql);
}

exports.deleteOrderDetailById = (detailId)=>{
    let sql = `DELETE FROM orderdetails WHERE detailId = ${detailId}`;
    return dbDAO.save(sql);
}

exports.countNumberOrder = (productId)=>{
    let sql = `SELECT count(*) as total FROM orderdetails WHERE productId = ${productId}`;
    return dbDAO.load(sql);
}