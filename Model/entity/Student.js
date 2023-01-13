const db = require("../DBConn")
module.exports = class Student {
    #strstudentId;
    #strguardianId;

    constructor() {
        this.#strstudentId = "";
        this.#strguardianId = "";

    }
    setStrStudentId(strstudentId) {
        this.#strstudentId = strstudentId;
    }
    getStrStudentId() {
        return this.#strstudentId;
    }
    setStrGuardianId(strguardianId) {
        this.#strguardianId = strguardianId;
    }
    getStrGuardianId() {
        return this.#strguardianId;
    }

    register() {
        var strsql = "INSERT INTO student(studentId) VALUES (" + db.escape(this.#strstudentId) + ")";
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

    static getStudent(schoolId, classId, year = null) {
        return new Promise(function (resolve, reject) {
            //var strSql ="SELECT a.*, b.* FROM (SELECT s.studentId, a.name FROM account a INNER JOIN student s ON s.studentId = a.accountId) a JOIN class_student cs ON a.studentId = cs.studentId JOIN (SELECT c.className,c.classId,s.fullName,s.schoolId FROM class c INNER JOIN school s ON s.schoolId = c.schoolId) b ON cs.classId = b.classId ";
            var strSql = "SELECT a.*,b.*,MAX(cs.startDate) FROM (SELECT s.studentId, a.name,a.disabled FROM account a INNER JOIN student s ON s. studentId=a.accountId) a JOIN class_student cs ON a.studentId=cs.studentId JOIN (SELECT c.className,c.classId,s.fullName,s.schoolId FROM class c INNER JOIN school s ON s.schoolId = c.schoolId) b ON cs.classId=b.classId"

            strSql += " WHERE b.schoolId = " + db.escape(schoolId)
            if (classId) {
                strSql += " AND b.classId = " + db.escape(classId)
            }
            if (!year) {
                strSql += " AND cs.startDate <= CURRENT_DATE AND cs.endDate > CURRENT_DATE "
            }
            strSql += " GROUP BY a.studentId"
            console.log(strSql)
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message);
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)));
                }
            });

        });
    }
}