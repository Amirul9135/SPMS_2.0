const Utils = require("../Controller/Utils")
const db = require("./DBConn")

module.exports = class Address {
    constructor(jObj) {
    }

    static saveAddress(addressObj) { //obj with accountId,addressText, areaId
        return new Promise(function (resolve, reject) {
            db.query(
                "INSERT INTO address (accountId,addressText,areaId) VALUES(" + db.escape(addressObj["accountId"])
                + "," + db.escape(addressObj["addressText"]) + "," + db.escape(addressObj["areaId"])
                + ") ON DUPLICATE KEY UPDATE addressText = VALUES(addressText), areaId = VALUES(areaId)",
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve()
                    }
                }
            )
        })

    }

    static getAddress(accountId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT * FROM ("
                + "SELECT p.postcode,p.postOffice,s.state_code,s.state_name FROM postcode p JOIN state s ON p.stateCode = s.state_code"
                + ") qa JOIN ("
                + "SELECT ad.accountId, ad.addressText,ad.areaId,ar.areaName,ar.postcode FROM address ad "
                + "JOIN area ar ON ad.areaId = ar.areaId WHERE ad.accountId=" + db.escape(accountId)
                + ") qb ON qa.postcode=qb.postcode"
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        reject("not found")
                    }
                    else {
                        resolve(result[0])
                    }
                }
            })
        })
    }

    static getState() {
        return new Promise(function (resolve, reject) {
            db.query("SELECT * FROM state", function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)))
                }
            })
        })
    }
    static getPostCode(stateId) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT postcode,postOffice FROM postcode WHERE stateCode=" + db.escape(stateId),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(JSON.parse(JSON.stringify(result)))
                    }
                })
        })
    }
    static getAreaInRegion(postcode) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT areaId,areaName FROM area where postcode=" + db.escape(postcode),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(JSON.parse(JSON.stringify(result)))
                    }
                }
            )
        })
    }

    static updateGeo(geoObj) {
        //geoObj 2 kaey, coord , areaPolygon  
        var skipOnce = true
        var strSql = "UPDATE area SET coord=  POINT(" + db.escape(Utils.nthKeyValOf(geoObj.coord, 0)) + "," + db.escape(Utils.nthKeyValOf(geoObj.coord, 1)) + ") , "
            + " areaPolygon = ST_GEOMFROMTEXT('POLYGON((" + db.escape(Utils.nthKeyValOf(geoObj.areaPolygon[0][0], 0)) + " " + db.escape(Utils.nthKeyValOf(geoObj.areaPolygon[0][0], 1))
        geoObj.areaPolygon[0].shift()
        geoObj.areaPolygon[0].forEach(p => {
            strSql += "," + db.escape(Utils.nthKeyValOf(p, 0)) + " " + db.escape(Utils.nthKeyValOf(p, 1))

        });
        strSql += "))') WHERE areaId=" + db.escape(geoObj.areaId)
        console.log(strSql)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    if (result.affectedRows == 0) {
                        reject('nochange')
                    }
                    else {
                        resolve()
                    }
                }
            })
        })

    }

    static getAreaGeo(areaId) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT coord,areaPolygon FROM area WHERE areaId=" + db.escape(areaId),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        result = JSON.parse(JSON.stringify(result))
                        if (result.length == 0) {
                            reject('notfound')
                        }
                        else {
                            resolve(result[0])
                        }
                    }
                })
        })
    }
}