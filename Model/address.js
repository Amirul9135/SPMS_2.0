
const Utils = require("../Controller/Utils")
const db = require("./DBConn")

module.exports = class Address {
    constructor(jObj) {
    }

    static saveAddress(addressObj) { //obj with accountId,addressText, areaId
        return new Promise(function (resolve, reject) {
            db.getConnection(async function (err, conn) {
                var cur = await new Promise(function (resolve, reject) {
                    conn.query("SELECT COUNT(*) AS count FROM address WHERE accountId=" + db.escape(addressObj["accountId"]) + " AND areaId=" + db.escape(addressObj["areaId"]) + " AND dateEnd = '0000-00-00'",
                        function (err, result) {
                            if (err) {
                                console.log(err)
                                reject(err.message)
                            }
                            else {
                                result = JSON.parse(JSON.stringify(result))
                                console.log(result)
                                resolve(result[0].count)
                            }
                        })
                })
                if (cur && cur != 0) {
                    return reject('nochange')
                }
                console.log('up')
                await new Promise(function (resolve, reject) {
                    conn.query("UPDATE address SET dateEnd=CURRENT_DATE WHERE accountId=" + db.escape(addressObj["accountId"]) + " AND dateEnd = '0000-00-00'",
                        function (err, result) {
                            if (err) {
                                reject(err)
                            }
                            else {
                                resolve()
                            }
                        })
                }).catch(function (err) {
                    console.log('sni')
                    console.log(err)
                })
                conn.query(
                    "INSERT INTO address (accountId,addressText,areaId,dateStart) VALUES(" + db.escape(addressObj["accountId"])
                    + "," + db.escape(addressObj["addressText"]) + "," + db.escape(addressObj["areaId"])
                    + ",CURRENT_DATE)",
                    function (err, result) {
                        if (err) {
                            reject(err.message)
                        }
                        else {
                            resolve()
                        }
                    })

                conn.release()
            })
        })

    }

    static getAddress(accountId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT * FROM ("
                + "SELECT p.postcode,p.postOffice,s.state_code,s.state_name FROM postcode p JOIN state s ON p.stateCode = s.state_code"
                + ") qa JOIN ("
                + "SELECT ad.accountId, ad.addressText,ad.areaId,ar.areaName,ar.postcode FROM address ad "
                + "JOIN area ar ON ad.areaId = ar.areaId WHERE ad.accountId=" + db.escape(accountId) + " AND dateEnd='0000-00-00'"
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

    static getCountyInState(stateCode) {
        return new Promise(function (resolve, reject) {
            db.query('SELECT countyId,name FROM county WHERE stateCode=' + db.escape(stateCode),
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
                            resolve(result)
                        }
                    }
                })
        })
    }
}