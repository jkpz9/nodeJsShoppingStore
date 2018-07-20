var baseDAO = require('../dbUtil/baseDAO');

exports.fetchAll = () => {
    var sql = 'SELECT * FROM provinces';
    return baseDAO.load(sql);
}