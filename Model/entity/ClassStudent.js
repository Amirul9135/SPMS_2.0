const db = require("../DBConn")
module.exports = class ClassStudent {
    #intclasslId;
    #strstudentId;
    #strstartDateclass;
    #strendDateclass;


    constructor() {
        this.#intclasslId = "";
        this.#strstudentId = "";
        this.#strstartDateclass = "";
        this.#strendDateclass = "";
    }

    setIntClassId(intclasslId) {
        this.#intclasslId = intclasslId;
    }
    getIntClassId() {
        return this.#intclasslId;
    }

    setStrStudentId(strstudentId) {
        this.#strstudentId = strstudentId;
    }
    getStrStudentId() {
        return this.#strstudentId;
    }

    setStrStartDateClass(strstartDateclass) {
        this.#strstartDateclass = strstartDateclass;
    }
    getStrStartDateClass() {
        return this.#strstartDateclass;
    }

    setStrEndDateClass(strendDateclass) {
        this.#strendDateclass = strendDateclass;
    }
    getStrEndDateClass() {
        return this.#strendDateclass;
    }


    register() {
        var strsql = "INSERT INTO class_student(classId,studentId,startDate,endDate) VALUES ('" + this.#intclasslId + "', '"
            + this.#strstudentId + "','" + this.#strstartDateclass + "','" + this.#strendDatestudent + "')";
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

    getClassTeacher(classId)
    {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT c.classId AS classId,c.className AS className, a.name AS name, COUNT(cs.classId) AS total, YEAR(CURRENT_DATE) AS year FROM class c LEFT JOIN class_student cs ON c.classId = cs.classId INNER JOIN school s ON s.schoolId = c.schoolId LEFT JOIN account a ON a.accountId = c.teacherId WHERE (cs.endDate > CURRENT_DATE OR cs.endDate IS NULL) AND c.classId = "+
            db.escape(classId);

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