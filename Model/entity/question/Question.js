
const db = require("../../DBConn")

module.exports = class Question {
    #intQuestionId;
    #strCreatorId;
    #intTopicId;
    #intQuestionType;
    #strQuestionText;
    #strDateCreate;
    constructor(jObj = null) {
        this.#intQuestionId = -1;
        this.#strCreatorId = "";
        this.#intTopicId = -1;
        this.#intQuestionType = -1;
        this.#strQuestionText = "";
        this.#strDateCreate = "";
        if (jObj != null) {
            if (jObj.hasOwnProperty("intQuestionId")) {
                this.#intQuestionId = jObj["intQuestionId"];
            }
            if (jObj.hasOwnProperty("strCreatorId")) {
                this.#strCreatorId = jObj["strCreatorId"];
            }
            if (jObj.hasOwnProperty("intTopicId")) {
                this.#intTopicId = jObj["intTopicId"];
            }
            if (jObj.hasOwnProperty("intQuestionType")) {
                this.#intQuestionType = jObj["intQuestionType"];
            }
            if (jObj.hasOwnProperty("strQuestionText")) {
                this.#strQuestionText = jObj["strQuestionText"];
            }
            if (jObj.hasOwnProperty("strDateCreate")) {
                this.#strDateCreate = jObj["strDateCreate"];
            }
        }
    }
    setIntQuestionId(intQuestionId) {
        this.#intQuestionId = intQuestionId
    }
    getIntQuestionId() {
        return this.#intQuestionId;
    }
    setStrDateCreate(strDateCreate) {
        this.#strDateCreate = strDateCreate
    }
    getStrDateCreate() {
        return this.#strDateCreate;
    }
    insertToDb() {
        var strSql = "INSERT INTO question(creatorId,topicId,questionType,questionText,dateCreated";
        strSql += ") VALUES (" + db.escape(this.#strCreatorId) + "," + db.escape(this.#intTopicId)
            + "," + db.escape(this.#intQuestionType) + "," + db.escape(this.#strQuestionText) + "," + db.escape(this.#strDateCreate)
        strSql += ")"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(result.insertId);
                }
            })
        })
    }
    deleteThis() {
        var strSql = "DELETE FROM question WHERE questionId=" + db.escape(this.#intQuestionId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(result.affectedRows)
                }
            })
        })
    }

    static tmpGetTopicBySub(subId) {
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

    addAttachments(atJson) {//json of {id:label}
        console.log(atJson)
        var strSQl = "INSERT INTO question_appendix (questionId,attachmentId,label) VALUES";
        Object.keys(atJson).forEach(key => {
            strSQl += "(" + db.escape(this.#intQuestionId) + "," + db.escape(key) + ", " + db.escape(atJson[key]) + "),";
        })
        strSQl = strSQl.substring(0, strSQl.length - 1);
        strSQl += " ON DUPLICATE KEY UPDATE label = VALUES(label)";
        return new Promise(function (resolve, reject) {
            db.query(strSQl, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve()
                }
            })
        })
    }

    toJSON() {
        return JSON.parse(JSON.stringify({
            "intQuestionId": this.#intQuestionId,
            "strCreatorId": this.#strCreatorId,
            "intTopicId": this.#intTopicId,
            "intQuestionType": this.#intQuestionType,
            "strQuestionText": this.#strQuestionText,
            "strDateCreate": this.#strDateCreate
        }))
    }

    update() {
        var strSql = "UPDATE question SET questionText=" + db.escape(this.#strQuestionText) + " WHERE questionId=" + db.escape(this.#intQuestionId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    if (result.affectedRows == 0) {
                        reject("not found")
                    }
                    resolve(result.affectedRows)
                }
            })
        })
    }

    static loadFromDb(questionId) {
        var strSql = "SELECT * FROM question WHERE questionId=" + db.escape(questionId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result));
                    if (result.length == 1) {
                        result = result[0];
                        resolve(new Question({
                            "intQuestionId": questionId,
                            "strCreatorId": result.creatorId,
                            "intTopicId": result.topicId,
                            "intQuestionType": result.questionType,
                            "strQuestionText": result.questionText,
                            "strDateCreate": result.dateCreated
                        }))
                    }
                    else {
                        reject("not found")
                    }
                }
            })
        })
    }

    static getAttachmentList(qId) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT * FROM question_appendix WHERE questionId=" + db.escape(qId), function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)))
                }
            })
        })
    }

    static findQuestion(keys) { //dStart,dEnd,subjectCode,topicId,questionType
        var strSql = "SELECT q.questionId,q.questionText,q.dateCreated,q.qType,st.topic,st.subject FROM "
            + "(SELECT q.questionId,q.creatorId,q.topicId,q.questionText,q.dateCreated,t.label AS qType, q.questionType FROM "
            + " question q JOIN question_type t ON q.questionType=t.qTypeId) q JOIN "
            + "(SELECT t.title AS topic, t.topicId, s.title AS subject, s.subjectCode FROM topic t JOIN subject s ON t.subjectCode = s.subjectCode) st ON st.topicId = q.topicId"


        strSql += " WHERE dateCreated>=" + db.escape(keys["dStart"]) + " AND dateCreated<=" + db.escape(keys["dEnd"]);

        if (keys.hasOwnProperty("subjectCode")) {
            strSql += " AND st.subjectCode=" + db.escape(keys["subjectCode"])
        }

        if (keys.hasOwnProperty("topicId")) {
            strSql += " AND q.topicId=" + db.escape(keys["topicId"])
        }
        if (keys.hasOwnProperty("questionType")) {
            strSql += " AND q.questionType=" + db.escape(keys["questionType"])
        }
        if (keys.hasOwnProperty("creatorId")) {
            strSql += " AND q.creatorId=" + db.escape(keys["creatorId"])
        }
        console.log(strSql)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)))
                }
            })
        })
    }

    static findQuestionInSet(setId) {
        var strsql = "SELECT qq.* FROM (SELECT q.questionId,q.questionText,q.dateCreated,q.qType,st.topic,st.subject FROM (SELECT q.questionId,q.creatorId,q.topicId,q.questionText,q.dateCreated,t.label AS qType, q.questionType FROM question q JOIN question_type t ON q.questionType=t.qTypeId) q JOIN (SELECT t.title AS topic,t.topicId,s.title AS subject,s.subjectCode FROM topic t JOIN subject s ON t.subjectCode=s.subjectCode) st ON st.topicId=q.topicId) qq JOIN question_set_item qs ON qq.questionId=qs.questionId"
            + " WHERE qs.questionSetId=" + db.escape(setId)
        return new Promise(function (resolve, reject) {
            db.query(strsql, function (err, result) {

                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)))
                }
            })
        })
    }

    static questionDetail(questionId) {
        var strsql = "SELECT q.*,st.subject,st.topic FROM question q JOIN (SELECT t.title AS topic,t.topicId,s.title AS subject FROM topic t JOIN subject s ON t.subjectCode=s.subjectCode) st ON st.topicId=q.topicId"
            + " WHERE q.questionId=" + db.escape(questionId);
        return new Promise(function (resolve, reject) {
            db.query(strsql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result))[0])
                }
            })
        })
    }

} 