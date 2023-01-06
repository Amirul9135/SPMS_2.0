const e = require("express")
const db = require("../../DBConn")

module.exports = class QuestionSet {
    static createNew(qSetName, qSetDesc, subjectCode) {
        //qSetName, qSetDesc
        return new Promise(function (resolve, reject) {
            db.query(
                "INSERT INTO question_set(name,description,subjectCode) VALUES (" + db.escape(qSetName) + "," + db.escape(qSetDesc)
                + "," + db.escape(subjectCode) + ")",
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve({ id: result.insertId })
                    }
                }
            )
        })
    }


    static updateDetail(qSetId, qSetName, qSetDesc) {
        return new Promise(function (resolve, reject) {
            db.query("UPDATE question_set SET name=" + db.escape(qSetName) + ",description=" + db.escape(qSetDesc) + " WHERE questionSetId=" + db.escape(qSetId),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve()
                    }
                }
            )
        })
    }

    static addStaff(qSetId, staffId) {
        return new Promise(function (resolve, reject) {
            db.query("INSERT INTO question_set_staff (questionSetId,staffId) VALUES(" + db.escape(qSetId) + "," + db.escape(staffId) + ")",
                function (err, result) {
                    if (err) {
                        console.log(err)
                        if (err.errno == 1062) {
                            return resolve()
                        }
                        reject(err.message)
                    }
                    else {
                        resolve()
                    }
                }
            )
        })
    }

    static deleteSet(qSetId) {//qSetId
        return new Promise(function (resolve, reject) {
            db.query("DELETE FROM question_set WHERE questionSetId=" + db.escape(qSetId),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(result.affectedRows)
                    }
                }
            )
        })
    }
    static unlinkStaff(qSetId, staffId) {//qSetId,staffId
        return new Promise(function (resolve, reject) {
            db.query("SELECT * FROM question_set_staff WHERE questionSetId=" + db.escape(qSetId),//check berapa ramai linked
                function (err, result) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        result = JSON.parse(JSON.stringify(result))
                        if (result.length > 1) {//if more than 1 unlink
                            db.query("DELETE FROM question_set_staff WHERE questionSetId=" + db.escape(qSetId) + " AND staffId=" + db.escape(staffId),
                                function (err, result) {
                                    if (err) {
                                        reject(err.message)
                                    }
                                    else {
                                        resolve()
                                    }
                                }
                            )
                        }
                        else {//tinggal sorang padam sudah
                            db.query("DELETE FROM question_set WHERE questionSetId=" + db.escape(qSetId),
                                function (err, result) {
                                    if (err) {
                                        reject(err.message)
                                    }
                                    else {
                                        resolve(result.affectedRows)
                                    }
                                }
                            )
                        }
                    }
                })
        })
    }

    static addQuestion(qSetId, questionId) {
        return new Promise(function (resolve, reject) {
            db.query("INSERT INTO question_set_item(questionSetId,questionId) VALUES ("
                + db.escape(qSetId) + "," + db.escape(questionId) + ")",
                function (err, result) {
                    if (err) {
                        if (err.errno == 1062) {
                            reject("duplicate")
                        }
                        else {
                            reject(err.message)

                        }
                    }
                    else {
                        resolve();
                    }
                }
            )

        })

    }
    static removeQuestion(qSetId, questionId) {
        return new Promise(function (resolve, reject) {
            db.query("DELETE FROM question_set_item WHERE questionSetId=" + db.escape(qSetId)
                + " AND questionId=" + db.escape(questionId),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve()
                    }
                }
            )
        })
    }

    static fetchQuestionSet(staffId, subj = null) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT qss.* FROM (SELECT qs.*,qc.count FROM (SELECT qs.*,s.title AS subject FROM question_set qs JOIN subject s ON qs.subjectCode=s.subjectCode) qs LEFT JOIN (SELECT questionSetId, COUNT(questionId) AS count FROM question_set_item GROUP BY questionSetId) qc ON qs.questionSetId=qc.questionSetId) qss JOIN question_set_staff staff ON qss.questionSetId=staff.questionSetId"
                + " WHERE staff.staffId=" + db.escape(staffId)
            if (subj != null) {
                strSql += " AND subjectCode=" + db.escape(subj)
            }
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

    static getQuestionCount(qsId) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT count(questionId) AS count FROM question_set_item WHERE questionSetId=" + db.escape(qsId),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(JSON.parse(JSON.stringify(result))[0].count)
                    }
                }
            )
        })
    }
}