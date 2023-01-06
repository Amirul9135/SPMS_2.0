const db = require("../DBConn")
module.exports = class School {
    #intschoolId;
    #strfullNamesch;
    #strabbrvsch;
    #strdescriptionsch;


    constructor() {
        this.#intschoolId = "";
        this.#strfullNamesch = "";
        this.#strabbrvsch = "";
        this.#strdescriptionsch = "";
    }

    setIntSchoolId(intschoolId) {
        this.#intschoolId = intschoolId;
    }
    getIntSchoolId() {
        return this.#intschoolId;
    }

    setStrFullNameSch(strfullNamesch) {
        this.#strfullNamesch = strfullNamesch;
    }
    getStrFullNameSch() {
        return this.#strfullNamesch;
    }

    setStrAbbrvSch(strabbrvsch) {
        this.#strabbrvsch = strabbrvsch;
    }
    getStrAbbrvSch() {
        return this.#strabbrvsch;
    }

    setStrDescriptionSch(strdescriptionsch) {
        this.#strdescriptionsch = strdescriptionsch;
    }
    getStrDescriptionSch() {
        return this.#strdescriptionsch;
    }

    register() {
        var strsql = "INSERT INTO school(schoolId,fullName,abbrv,description) VALUES ('"
            + this.#intschoolId + "', '" + this.#strfullNamesch + "', '" + this.#strabbrvsch + "', '" + this.#strdescriptionsch + "')";

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
    update() {
        var strSql = "UPDATE school SET fullName = " + db.escape(this.#strfullNamesch) + ", abbrv = " + db.escape(this.#strabbrvsch) + ", description = " + db.escape(this.#strdescriptionsch) + " WHERE schoolId=" + db.escape(this.#intschoolId);
        console.log(strSql)
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

    delete() {
        var strSql = "DELETE FROM school WHERE schoolId='" + this.#intschoolId + "'";
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

    static getSchool(schoolId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT fullName,abbrv,description FROM  school WHERE schoolId =  " + db.escape(schoolId);
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
}