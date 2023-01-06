const db = require("../DBConn")
module.exports= class ClassName{
    #intCNId;
    #strfullNameClass;
    #strabbrvclass;
   

    constructor() {
        this.#intCNId = "";
        this.#strfullNameClass = "";
        this.#strabbrvclass = "";
    }

    setIntCNId(intCNId) {
        this.#intCNId = intCNId;
    }
    getIntCNId() {
        return this.#intCNId;
    }

    setStrFullNameClass(strfullNameClass) {
        this.#strfullNameClass = strfullNameClass;
    }
    getStrFullNameClass() {
        return this.#strfullNameClass;
    }

    setStrAbbrvClass(strabbrvclass) {
        this.#strabbrvclass = strabbrvclass;
    }
    getStrAbbrvClass() {
        return this.#strabbrvclass;
    }

   
    register() {
        
        var strsql = "INSERT INTO class_name(CNId,fullname,abbrv) VALUES ('"+ this.#intCNId +"','"
        + this.#strfullNameClass +"','"+ this.#strabbrvclass +"')";
        console.log(strsql); 
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
        var strSql = "UPDATE class_name SET fullname = " + db.escape(this.#strfullNameClass) + ", abbrv = " + db.escape(this.#strabbrvclass) + " WHERE CNId=" + db.escape(this.#intCNId);
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
        var strSql = "DELETE FROM class_name WHERE CNId='" + this.#intCNId + "'";
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