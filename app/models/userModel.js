const baseDAO = require('../dbUtil/baseDAO');

exports.fetchAll = () => {
    var sql = 'SELECT * FROM members';
    return baseDAO.load(sql);
}


exports.isExistedUsername = (usernameOrEmail) => {
     return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM members WHERE username = '${usernameOrEmail}' OR emailAddress = '${usernameOrEmail}'`;
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

exports.fetchSingle = (id) => {
    return new Promise((resolve, reject) => {
        var sql = `SELECT * FROM members WHERE memberId = ${id}`;
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

exports.add = (user) => {
    var sql = `INSERT INTO members(firstName,lastName,username,dob,gender,encryptedPassword,phoneNumber,emailAddress,livingTownId,lingvingAddress) VALUES('${user.firstName}','${user.lastName}','${user.username}','${user.dob}','${user.gender}','${user.encryptedPassword}','${user.phoneNumber}','${user.emailAddress}','${user.livingTownId}','${user.livingAddress}')`;
    return baseDAO.save(sql);
}


exports.update = (user) => {
     var sql = `Update members SET phoneNumber='${user.phoneNumber}', emailAddress = '${user.emailAddress}' Where memberId = '${id}'`;
    return baseDAO.save(sql);
}

exports.delete = (id) => {
    var sql = `Update user SET active=false Where memberId = '${id}'`;
    return baseDAO.save(sql);
}

exports.changePassword = (newPassword, userId) => {
     var sql = `Update members SET encryptedPassword='${newPassword}' Where memberId = '${userId}'`;
    return baseDAO.save(sql);
}

exports.updateProfile = (options, userId) => {
     var sql = `Update members SET lingvingAddress='${options.livingAddress}', livingTownId=${options.livingDistrict}, phoneNumber='${options.phoneNumber}' Where memberId = '${userId}'`;
    return baseDAO.save(sql);
}


exports.findById = (id) => {
     return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM members WHERE memberId = ${id}`;
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



// get address
exports.getAddressInfos = (memberId) => {
    let sql = `SELECT m.lingvingAddress AS 'Street', c.cityName AS 'Dicstrict',p.provinceName AS 'Province'
               FROM members m, cities c, provinces p
               WHERE m.memberId = ${memberId} AND c.cityId = m.livingTownId AND c.provinceId = p.provinceId`;
    return baseDAO.load(sql);
}