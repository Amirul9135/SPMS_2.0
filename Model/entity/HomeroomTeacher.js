const db = require("../DBConn")
module.exports= class HomeroomTeacher{
    #intclasslId;
    #strteacherId;
    #strstartDateHT;
    #strendDateHT;


    constructor() {
        this.#intclasslId = "";
        this.#strteacherId = "";
        this.#strstartDateHT = "";
        this.#strendDateHT = "";
    }
    
    setIntClassId(intclasslId) {
        this.#intclasslId = intclasslId;
    }
    getIntClassId() {
        return this.#intclasslId;
    }

    setStrTeacherId(strteacherId) {
        this.#strteacherId = strteacherId;
    }
    getStrTeacherId() {
        return this.#strteacherId;
    }

    setStrStartDateHT(strstartDateHT) {
        this.#strstartDateHT = strstartDateHT;
    }
    getStrStartDateHT() {
        return this.#strstartDateHT;
    }

    setStrEndDateHT(strendDateHT) {
        this.#strendDateHT = strendDateHT;
    }
    getStrEndDateHT() {
        return this.#strendDateHT;
    }


    register() {
        
        var strsql = "INSERT INTO homeroom_teacher(classId,teacherId,start,end) VALUES ('"+ this.#intclasslId +"', '"
        + this.#strteacherId +"','"+ this.#strstartDateHT +"','"+ this.#strendDateHT +"')";
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
        var strSql = "UPDATE homeroom_teacher SET start = " + db.escape(this.#strstartDateHT) + ", end = " + db.escape(this.#strendDateHT) +  " WHERE classId=" + db.escape(this.#intclasslId);
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
        var strSql = "DELETE FROM homeroom_teacher WHERE classId='" + this.#intclasslId + "'";
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
}