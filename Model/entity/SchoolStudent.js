const db = require("../DBConn")
module.exports= class SchoolStudent{
    #intschoolId;
    #strstudentId;
    #strenrolDate;
    #strendDatestudent;


    constructor() {
        this.#intschoolId = "";
        this.#strstudentId = "";
        this.#strenrolDate = "";
        this.#strendDatestudent = "";
    }
    
    setIntSchoolId(intschoolId) {
        this.#intschoolId = intschoolId;
    }
    getIntSchoolId() {
        return this.#intschoolId;
    }

    setStrStudentId(strstudentId) {
        this.#strstudentId = strstudentId;
    }
    getStrStudentId() {
        return this.#strstudentId;
    }

    setStrEnrolDate(strenrolDate) {
        this.#strenrolDate = strenrolDate;
    }
    getStrEnrolDate() {
        return this.#strenrolDate;
    }

    setStrEndDateStudent(strendDatestudent) {
        this.#strendDatestudent = strendDatestudent;
    }
    getStrEndDateStudent() {
        return this.#strendDatestudent;
    }

  
    register() {
        
        var strsql = "INSERT INTO school_student(schoolId,studentId,enrollDate,endDate) VALUES ('"+ this.#intschoolId +"', '"
        + this.#strstudentId +"','"+ this.#strenrolDate +"','"+ this.#strendDatestudent +"')";
            console.log(strsql); 
            return new Promise(function(resolve, reject){ 
       
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
        var strSql = "UPDATE school_student SET enrollDate = " + db.escape(this.#strenrolDate) + ", endDate = " + db.escape(this.#strendDatestudent) +  " WHERE studentId=" + db.escape(this.#strstudentId);
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
}