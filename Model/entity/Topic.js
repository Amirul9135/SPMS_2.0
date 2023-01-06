const db = require("../DBConn")

module.exports = class Topic {
    #intTopicId;
    #strSubjectCode;
    #strTopicTitle;
    constructor(jObj = null) {
        this.#intTopicId = -1;
        this.#strSubjectCode = "";
        this.#strTopicTitle = "";
        if (jObj != null) {
            if (jObj.hasOwnProperty("intTopicId")) {
                this.#intTopicId = jObj["intTopicId"];
            }
            if (jObj.hasOwnProperty("strSubjectCode")) {
                this.#strSubjectCode = jObj["strSubjectCode"];
            }
            if (jObj.hasOwnProperty("strTopicTitle")) {
                this.#strTopicTitle = jObj["strTopicTitle"];
            }
        }
    }
    setIntTopicId(intTopicId) {
        this.#intTopicId = intTopicId
    }
    getIntTopicId() {
        return this.#intTopicId;
    }

    setStrSubjectCode(strSubjectCode) {
        this.#strSubjectCode = strSubjectCode
    }
    getStrSubjectCode() {
        return this.#strSubjectCode;
    }

    setStrTopicTitle(strTopicTitle) {
        this.#strTopicTitle = strTopicTitle
    }
    getStrTopicTitle() {
        return this.#strTopicTitle;
    }


    //Register topic
    registerTopic() {
        var strSql = "INSERT INTO topic(title, subjectCode) VALUES (" + db.escape(this.#strTopicTitle) + ", " + db.escape(this.#strSubjectCode) + ")";

        return new Promise(function (resolve, reject) {
            //js function to insert data (callback function)
            db.query(strSql, function (err, result) {
                if (err) {
                    console.log("Error: " + err.message);
                    reject(err.message);
                }
                else {
                    resolve();
                }
            });
        });
    }


    // Update Topic
    updateTopic() 
    {
        var strSql = "UPDATE topic SET title= " + db.escape(this.#strTopicTitle) + " WHERE topicId= " + db.escape(this.#intTopicId);
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
    deleteTopic() {
        var strSql = "DELETE FROM topic WHERE topicId= " + db.escape(this.#intTopicId);
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


    // List all topic
    static getAll() {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT * FROM topic ORDER BY title ASC";
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


    // get specific topic
    static getTopic(topicId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT subjectCode,title FROM topic WHERE topicId = " + db.escape(topicId);
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


    toJSON() {
        return JSON.parse(JSON.stringify({
            "intTopicId": this.#intTopicId,
            "strSubjectCode": this.#strSubjectCode,
            "strTopicTitle": this.#strTopicTitle
        }));
    }


    static loadFromDb(topicId) {
        var strsql = "SELECT * FROM topic WHERE topicId=" + db.escape(topicId)
        return new Promise(function (resolve, reject) {
            db.query(strsql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result));
                    if (result.length == 1) {
                        result = result[0];
                        resolve(new Topic({
                            "intTopicId": result.topicId,
                            "strSubjectCode": result.subjectCode,
                            "strTopicTitle": result.title
                        }))
                    }
                    else {
                        reject("not found")
                    }
                }
            })
        })
    }

    static getTopicBySub(subId) {
        var strSql = "SELECT * FROM topic where subjectCode=" + db.escape(subId);
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
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