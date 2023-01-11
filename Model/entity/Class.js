const db = require("../DBConn")
module.exports = class Class {
    #intclassId;
    #intschoolId;
    #strClassName;
    #straccountId;
    #strstudentId;

    constructor() {
        this.#intclassId = "";
        this.#intschoolId = "";
        this.#strClassName = "";
        this.#straccountId = "";
        this.#strstudentId = "";
    }

    setIntClassId(intclassId) {
        this.#intclassId = intclassId;
    }
    getIntClassId() {
        return this.#intclassId;
    }

    setIntSchoolId(intschoolId) {
        this.#intschoolId = intschoolId;
    }
    getIntSchoolId() {
        return this.#intschoolId;
    }

    setIntClassName(strClassName) {
        this.#strClassName = strClassName;
    }
    getIntClassName() {
        return this.#strClassName;
    }
    setStrAccountId(straccountId) {
        this.#straccountId = straccountId;
    }
    getStrAccountId() {
        return this.#straccountId;
    }
    setStrStudentId(strstudentId) {
        this.#strstudentId = strstudentId;
    }
    getStrStudentId() {
        return this.#strstudentId;
    }

    register() {
        var strsql = "INSERT INTO class(schoolId,className,teacherId) VALUES (" + db.escape(this.#intschoolId) + ", " + db.escape(this.#strClassName) + ", " + db.escape(this.#straccountId) + ")";
        console.log(strsql);
        return new Promise(function (resolve, reject) {

            console.log(strsql);
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
        var strSql = "UPDATE class SET teacherId = " + db.escape(this.#straccountId) + ", ClassName = " + db.escape(this.#strClassName) + " WHERE classId=" + db.escape(this.#intclassId);
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

    // Delete topic
    delete() {
        var strSql = "DELETE FROM class WHERE classId= " + db.escape(this.#intclassId);
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

    static getClassBySchool(schoolId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT c.classId AS classId,c.className AS className, a.name AS name, COUNT(cs.classId) AS total FROM class c LEFT JOIN class_student cs ON c.classId = cs.classId INNER JOIN school s ON s.schoolId = c.schoolId LEFT JOIN account a ON a.accountId = c.teacherId WHERE (cs.endDate > CURRENT_DATE OR cs.endDate IS NULL) AND s.schoolId = " + db.escape(schoolId) + " GROUP BY c.classId";

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

    static getClass(classId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT * FROM  class WHERE classId =  " + db.escape(classId);
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

    static getTeacher() {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT accountId, name FROM account WHERE userType = 2";
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

    static getstudentclass(studentId) {
        return new Promise(function (resolve, reject) {
            // var strSql = "SELECT a.* ,b.* FROM (SELECT studentId, name FROM account a INNER JOIN student  ON studentId=accountId) a JOIN class_student  ON studentId=studentId JOIN (SELECT className,classId,fullName,schoolId FROM class INNER JOIN school ON schoolId = schoolId)  ON classId=classId  " + db.escape(studentId);
            //var strSql = "SELECT account.accountId, account.name  FROM  account JOIN class_student ON studentId=account.accountId JOIN class on class.classId =class_student.studentId =  " + db.escape(studentId);
            var strSql = "SELECT sa.* FROM class c JOIN class_student cs ON c.classId=cs.classId JOIN (SELECT s.studentId, a.name, a.phone FROM account a JOIN student s ON a.accountId=s.studentId) sa ON cs.studentId=sa.studentId WHERE c.classId= " + db.escape(studentId);

            db.query(strSql, function (err, result) {
                if (err) {
                    console.log(this.strSql);
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result))[0]);
                    console.log(this.strSql);
                }
            });
        });
    }

    static getAllClassInSchool(schoolId) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT classId,className FROM class WHERE schoolId=" + db.escape(schoolId),
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
}