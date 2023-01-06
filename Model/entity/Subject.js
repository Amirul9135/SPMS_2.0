const db = require("../DBConn")

module.exports = class Subject{
    #strSubjectCode;
    #strSubjectTitle;

    constructor() {
        this.#strSubjectCode = "";
        this.#strSubjectTitle = "";
    }

    setSubjectCode(subjectCode) {
        this.#strSubjectCode = subjectCode;
    }
    getSubjectCode() {
        return this.#strSubjectCode;
    }

    setSubjectTitle(subjectTitle) {
        this.#strSubjectTitle = subjectTitle;
    }
    getSubjectTile() {
        return this.#strSubjectTitle;
    }

    register()
    {
        //sql command
        var strSql = "INSERT INTO subject(subjectCode, title) VALUES (" + db.escape(this.#strSubjectCode) + ", " + db.escape(this.#strSubjectTitle) + ")";

        return new Promise(function(resolve, reject){
            //js function to insert data (callback function)
            db.query(strSql, function(err, result)
            {
                if(err) 
                {
                    console.log("Error: " + err.message);
                    reject(err.message);
                }  
                else
                {
                    resolve();
                }
            });
        });
    }

    update() 
    {
        var strSql = "UPDATE subject SET title= " + db.escape(this.#strSubjectTitle) + " WHERE subjectCode= " + db.escape(this.#strSubjectCode);
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

    deleteThis() {
        var strSql = "DELETE FROM subject WHERE subjectCode= " + db.escape(this.#strSubjectCode);
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

    static getAll() {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT * FROM subject";
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

    static getSubject(subjectCode) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT subjectCode,title FROM subject WHERE subjectCode =  " + db.escape(subjectCode);
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