const db = require("../../DBConn")
module.exports = class QuestionAnswer {

    #intAnswerNo;
    #intQuestionId;
    #strAnswerText;
    #dblRelativeMark;
    #intAttachmentId;
    constructor(jObj = null) {
        this.#intAnswerNo = -1;
        this.#intQuestionId = -1;
        this.#strAnswerText = "";
        this.#dblRelativeMark = -1;
        this.#intAttachmentId = -1;
        if (jObj != null) {
            if (jObj.hasOwnProperty("intAnswerNo")) {
                this.#intAnswerNo = jObj["intAnswerNo"];
            }
            if (jObj.hasOwnProperty("intQuestionId")) {
                this.#intQuestionId = jObj["intQuestionId"];
            }
            if (jObj.hasOwnProperty("strAnswerText")) {
                this.#strAnswerText = jObj["strAnswerText"];
            }
            if (jObj.hasOwnProperty("dblRelativeMark")) {
                this.#dblRelativeMark = jObj["dblRelativeMark"];
            }
            if (jObj.hasOwnProperty("intAttachmentId")) {
                this.#intAttachmentId = jObj["intAttachmentId"];
            }
        }
    }

    static bulkInsert(intStart, qAnsObj) {//pass start no and object contain array of answer json object
        var strsql = "INSERT INTO question_answer (answerNo,questionId,answerText,relativeMark,attachmentId) VALUES";
        var intI = 0;
        qAnsObj.forEach(ans => {
            strsql += "(" + (intStart + intI) + "," + db.escape(ans["intQuestionId"])
                + "," + db.escape(ans["strAnswerText"]) + "," + db.escape(ans["dblRelativeMark"]);
            if (ans["intAttachmentId"] != -1) {
                strsql += "," + db.escape(ans["intAttachmentId"]);
            }
            else {
                strsql += ",NULL";
            }
            strsql += "),";
            intI++;
        });
        strsql = strsql.substring(0, strsql.length - 1);
        return new Promise(function (resolve, reject) {
            db.query(strsql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else {
                    resolve();
                }
            })
        })
    }


    static bulkUpdate(qAnsObj) {//pass start no and object contain array of answer json object
        var strsql = "INSERT INTO question_answer (answerNo,questionId,answerText,relativeMark,attachmentId) VALUES";
        qAnsObj.forEach(ans => {
            strsql += "(" + db.escape(ans["intAnswerNo"]) + "," + db.escape(ans["intQuestionId"])
                + "," + db.escape(ans["strAnswerText"]) + "," + db.escape(ans["dblRelativeMark"]);
            if (ans["intAttachmentId"] != -1) {
                strsql += "," + db.escape(ans["intAttachmentId"]);
            }
            else {
                strsql += ",NULL";
            }
            strsql += "),";
        });
        strsql = strsql.substring(0, strsql.length - 1);

        strsql += " ON DUPLICATE KEY UPDATE answerText = VALUES(answerText), relativeMark= VALUES(relativeMark), attachmentId = VALUES(attachmentId)";

        return new Promise(function (resolve, reject) {
            db.query(strsql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else {
                    resolve();
                }
            })
        })
    }

    static getNewAnswerNo(qvObj) { //qvObj = questionObject must have [intQuestionId] and [langId]
        return new Promise(function (resolve, reject) {
            db.query("SELECT MAX(answerNo) AS num FROM question_answer WHERE questionId = " + db.escape(qvObj["intQuestionId"])
                , function (err, result) {
                    if (err) {
                        console.log(err)
                        reject(err.message);
                    }
                    else {
                        console.log(result)
                        resolve(JSON.parse(JSON.stringify(result))[0]["num"] + 1);
                    }
                })
        })
    }

    deleteThis() {
        var strSql = "DELETE FROM question_answer WHERE answerNo=" + db.escape(this.#intAnswerNo) + " AND questionId=" + db.escape(this.#intQuestionId)
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

    static getAllAnswers(qId) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT * FROM question_answer WHERE questionId=" + db.escape(qId) + " ORDER BY answerNo ASC",
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        if (result.length == 0)
                            reject("not found")
                        resolve(JSON.parse(JSON.stringify(result)))
                    }
                })
        })
    }

    static fetchAnswerChoice(arrId) {//array of question Id
        return new Promise(function (resolve, reject) {

            if (arrId.length == 0) {
                reject()
            }

            var strSql = "SELECT questionId, answerNo,answerText,attachmentId FROM question_answer WHERE "
            var once = true
            arrId.forEach(id => {
                if (once) {
                    strSql += " questionId=" + db.escape(id)
                    once = false
                }
                else {

                    strSql += " OR questionId=" + db.escape(id)
                }

            })
            strSql += " ORDER BY RAND()"
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
