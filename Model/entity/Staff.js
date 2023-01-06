const db = require("../DBConn")
module.exports = class Staff {
    #strstaffId;

    constructor() {
        this.#strstaffId = "";
    }
    setStrStaffId(strstaffId) {
        this.#strstaffId = strstaffId;
    }
    getStrStaffId() {
        return this.#strstaffId;
    }

    register() {

        var strsql = "INSERT INTO staff(staffId) VALUES ('" + this.#strstaffId + "')";
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

    static getStaff(schoolId){
        return new Promise(function(resolve, reject){
            var strSql ="SELECT staff.*, s.schoolId, s.fullname FROM school s JOIN school_teacher st ON s.schoolId = st.schoolId JOIN (SELECT s.staffId, a.name FROM account a INNER JOIN staff s ON s.staffId = a.accountId) staff ON staff.staffId = st.teacherId";
            strSql +=" WHERE st.schoolId = " +db.escape(schoolId) 
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
}