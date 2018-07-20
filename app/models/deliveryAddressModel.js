var baseDAO = require('../dbUtil/baseDAO');


// add devivery address for the order
exports.add = (addr)  => {
	let sql = `INSERT INTO deliveryAddresses(orderId, phoneNumber, deliveryDistrict, deliveryAddress) 
			   VALUES('${addr.orderId}', '${addr.phoneNumber}', ${addr.TownId}, '${addr.Street}')`;
    return baseDAO.save(sql);
}

exports.single = (id) =>{
    return new Promise((resolve, reject) => {
        let sql = `select * from deliveryaddresses where id = ${id}`;
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

exports.loadDeliveryByOrderId = (orderId)=>{
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM deliveryaddresses dl, cities ct, provinces pr WHERE dl.orderId = ${orderId} and dl.deliveryDistrict = ct.cityId and ct.provinceId = pr.provinceId`;
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
    return baseDAO.load(sql);
}

exports.deleteDeliveryAddressByOrderId = (orderId)=>{
    let sql = `DELETE FROM deliveryaddresses WHERE orderId = ${orderId}`;
    return baseDAO.save(sql);
}