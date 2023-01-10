const db = require("../DBConn")
module.exports = class Staff {
    #strstaffId;
    #intschoolId;

    constructor() {
        this.#strstaffId = "";
    }
    setStrStaffId(strstaffId) {
        this.#strstaffId = strstaffId;
    }
    getStrStaffId() {
        return this.#strstaffId;
    }
    setIntschoolId(intschoolId) {
        this.#intschoolId = intschoolId
    }
    getIntschoolId() {
        return this.#intschoolId;
    }


    register() {
        var strsql = "INSERT INTO staff(staffId,schoolId) VALUES (" + db.escape(this.#strstaffId) + "," + db.escape(this.#intschoolId) + ")";
        return new Promise(function (resolve, reject) {
            db.query(strsql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else {
                    resolve();
                }
            });
        });
    }

    static getStaffList(schoolId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT a.accountId,a.name,a.email,a.phone, group_concat(c.className) as class,a.disabled FROM account a JOIN staff s ON a.accountId=s.staffId LEFT JOIN class c ON s.staffId=c.teacherId";
            strSql += " WHERE s.schoolId = " + db.escape(schoolId) + " GROUP BY s.staffId"
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

    updateSchool() {
        var strSql = "UPDATE staff SET schoolId=" + db.escape(this.#intschoolId) + " WHERE staffId=" + db.escape(this.#strstaffId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        reject('nochange')
                    }
                    else {

                        resolve()
                    }
                }
            })
        })
    }
}