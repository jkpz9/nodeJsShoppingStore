var baseDAO = require('../dbUtil/baseDAO');

exports.fetchList = (provinceId) => {
    var sql = `SELECT * FROM cities where provinceId = ${provinceId}`;
    return baseDAO.load(sql);
}

exports.findById = (id) => {
     return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM cities WHERE cityId = ${id}`;
        baseDAO.load(sql)
               .then(rows => {
                    if (rows.length == 0) {
                        resolve(null);
                    }
                    else {
                        resolve(rows[0]);
                    } })
                .catch(err => {
                    reject(err);
        });
    });
}