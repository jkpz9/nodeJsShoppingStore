const dbDAO = require('../dbUtil/baseDAO');

exports.single = (id) =>{
    return new Promise((resolve, reject) => {
        let sql = `select * from members mb where mb.memberId = ${id}`;
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