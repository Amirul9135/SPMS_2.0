const db = require("../DBConn")

module.exports = class School {
    #intSchoolId;
    #strFullName;
    #strAbbrv;
    #strDescription;
    #intAreaId;
    #intCounty;

    constructor() {
        this.#intSchoolId = "";
        this.#strFullName = "";
        this.#strAbbrv = "";
        this.#strDescription = "";
        this.#intAreaId = "";
    }
    setIntCounty(countyId) {
        this.#intCounty = countyId
    }
    setIntSchoolId(schoolId) {
        this.#intSchoolId = schoolId;
    }
    getIntSchoolId() {
        return this.#intSchoolId;
    }

    setStrFullName(fullName) {
        this.#strFullName = fullName;
    }
    getStrFullName() {
        return this.#strFullName;
    }

    setStrAbbrv(strAbbrv) {
        this.#strAbbrv = strAbbrv;
    }
    getStrAbbrv() {
        return this.#strAbbrv;
    }

    setStrDescription(strDescription) {
        this.#strDescription = strDescription;
    }
    getStrDescription() {
        return this.#strDescription;
    }

    setIntAreaId(intAreaId) {
        this.#intAreaId = intAreaId;
    }
    getIntAreaId() {
        return this.#intAreaId;
    }


    // Register School
    registerSchool() {
        var strSql = "INSERT INTO school(fullName, abbrv, description,county) VALUES (" + db.escape(this.#strFullName) + ", " + db.escape(this.#strAbbrv) + "," + db.escape(this.#strDescription) + "," + db.escape(this.#intCounty) + ")";

        return new Promise(function (resolve, reject) {
            //js function to insert data (callback function)
            db.query(strSql, function (err, result) {
                if (err) {
                    console.log("Error: " + err.message);
                    reject(err.message);
                }
                else {
                    resolve();
                }
            });
        });
    }

    // Update school
    updateSchool() {
        var strSql = "UPDATE school SET fullName= " + db.escape(this.#strFullName) + ", abbrv=" + db.escape(this.#strAbbrv) + ", description=" + db.escape(this.#strDescription) + " WHERE schoolId= " + db.escape(this.#intSchoolId);
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else if (result.affectedRows == 0) {
                    reject("no changes")
                }
                else {
                    resolve();
                }
            });
        });

    }

    deleteSchool() {
        var strSql = "DELETE FROM school WHERE schoolId= " + db.escape(this.#intSchoolId);
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else if (result.affectedRows == 0) {
                    reject("no changes")
                }
                else {
                    resolve("success");
                }
            });
        });
    }

    static getAll() {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT * FROM school";
            db.query(strSql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)));
                }
            });
        });
    }

    static getSchool(schoolId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT * FROM  school WHERE schoolId =  " + db.escape(schoolId) + " ORDER BY fullName"
            db.query(strSql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result))[0]);
                }
            });
        });
    }

    static schoolByCounty(countyId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT * FROM school WHERE county=" + db.escape(countyId)
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        reject('no record')
                    }
                    else {
                        resolve(result)
                    }
                }
            })
        })
    }
}