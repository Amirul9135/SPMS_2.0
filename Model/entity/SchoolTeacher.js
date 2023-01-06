const db = require("../DBConn")
module.exports= class SchoolTeacher{
    #intschoolId;
    #strteacherId;
    #strstartDate;
    #strendDate;


    constructor() {
        this.#intschoolId = "";
        this.#strteacherId = "";
        this.#strstartDate = "";
        this.#strendDate = "";
    }
    
    setIntSchoolId(intschoolId) {
        this.#intschoolId = intschoolId;
    }
    getIntSchoolId() {
        return this.#intschoolId;
    }

    setStrTeacherId(strteacherId) {
        this.#strteacherId = strteacherId;
    }
    getStrTeacherId() {
        return this.#strteacherId;
    }

    setStrStartDate(strstartDate) {
        this.#strstartDate = strstartDate;
    }
    getStStartDate() {
        return this.#strstartDate;
    }

    setStrEndDate(strendDate) {
        this.#strendDate = strendDate;
    }
    getStrEndDate() {
        return this.#strendDate;
    }


    register() {
        
        var strsql = "INSERT INTO school_teacher(schoolId,teacherId,startDate,endDate) VALUES ('"+ this.#intschoolId +"', '"
        + this.#strteacherId +"','"+ this.#strstartDate +"','"+ this.#strendDate +"')";
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
        var strSql = "UPDATE school_teacher SET startDate = " + db.escape(this.#strstartDate) + ", endDate = " + db.escape(this.#strendDate) + " WHERE schoolId=" + db.escape(this.#intschoolId);
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