const db = require("../../DBConn")
const utils = require('../../../Controller/Utils')

module.exports = class Assessment {
    assessmentId
    title
    description
    open
    close
    duration
    subject
    grading
    constructor(jObj = null) {
        this.assessmentId = undefined;
        this.title = undefined;
        this.description = undefined;
        this.open = undefined;
        this.close = undefined;
        this.duration = undefined;
        this.subject = undefined;
        if (jObj != null) {
            if (jObj.hasOwnProperty("assessmentId")) {
                this.assessmentId = jObj["assessmentId"];
            }
            if (jObj.hasOwnProperty("title")) {
                this.title = jObj["title"];
            }
            if (jObj.hasOwnProperty("description")) {
                this.description = jObj["description"];
            }
            if (jObj.hasOwnProperty("open")) {
                this.open = jObj["open"];
            }
            if (jObj.hasOwnProperty("close")) {
                this.close = jObj["close"];
            }
            if (jObj.hasOwnProperty("duration")) {
                this.duration = jObj["duration"];
            }
            if (jObj.hasOwnProperty("subject")) {
                this.subject = jObj["subject"];
            }
        }
    }

    createNew() {
        var strSql = "INSERT INTO assessment(title,description,open,close,duration,subject) VALUES("
            + db.escape(this.title) + "," + db.escape(this.description) + "," + db.escape(this.open) + "," + db.escape(this.close) + ","
            + db.escape(this.duration) + "," + db.escape(this.subject)
            + ")"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(result.insertId)
                }
            })
        })
    }

    load() {//this.id
        var strSql = "SELECT * FROM assessment WHERE assessmentId=" + db.escape(this.assessmentId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length < 1) {
                        reject("not found")
                    }
                    else {
                        resolve(result)
                    }
                }
            })
        })

    }

    deleteThis() {//this.id
        var strSql = "DELETE FROM assessment WHERE assessmentId=" + db.escape(this.assessmentId)
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

    static addStaff(assessmentId, staffId) {
        return new Promise(function (resolve, reject) {
            db.query("INSERT INTO assessment_staff (assessmentId,staffId) VALUES(" + db.escape(assessmentId) +
                "," + db.escape(staffId) + ")",
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

    removeStaff(staffId) {
        var strsql = "DELETE FROM assessment_staff WHERE assessmentId=" + db.escape(this.assessmentId) + " AND staffId=" + db.escape(staffId)
        return new Promise(function (resolve, reject) {
            db.query(strsql,
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(result.affectedRows)
                    }
                })
        })
    }

    checkStaffCount() {
        var strSql = "SELECT COUNT(staffId) AS count FROM assessment_staff WHERE assessmentId=" + db.escape(this.assessmentId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result))[0].count)
                }
            })
        })
    }

    totalFullMark() {
        var strSql = "SELECT SUM(a.mark) AS fullMark FROM ((SELECT SUM(mark) as mark,assessmentId FROM assessment_question WHERE assessmentId=" + db.escape(this.assessmentId)
            + " GROUP BY assessmentId) UNION (SELECT SUM(mark * count) as mark,assessmentId FROM assessment_question_set WHERE assessmentId=" + db.escape(this.assessmentId)
            + " GROUP BY assessmentId)) a;"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    var result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        return reject('nomark')
                    }
                    else {
                        return resolve(JSON.parse(JSON.stringify(result))[0].fullMark)
                    }

                }
            })
        })
    }



    static fetchStaffList(asId) {
        var strSql = "SELECT s.* FROM (SELECT s.staffId, a.name FROM staff s JOIN account a ON a.accountId=s.staffId) s JOIN (SELECT staffId FROM assessment_staff WHERE assessmentId="
            + db.escape(asId) + ") a ON s.staffId=a.staffId"
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

    static findByStaff(keys) {//filter by date start end kalau end untuk filter yg dah abes.. so ambil yg >= curdate.. curdate amek dari controller
        //id ni dari teacher wajib ada, no reason nk tgk smua
        //staffId : val 
        //status: ongoing/upcoming/past
        var strSql = "SELECT a.* FROM assessment a JOIN assessment_staff ast ON a.assessmentId=ast.assessmentId"
        strSql += " WHERE ast.staffId=" + db.escape(keys["staffId"])
        if (keys.hasOwnProperty("status")) {
            var dateTIme = utils.getDateTimeNow()
            if (keys.status == "ongoing") {
                strSql += " AND open<=" + db.escape(dateTIme) + " AND close>" + db.escape(dateTIme)
            }
            else if (keys.status == "upcoming") {
                strSql += " AND open>" + db.escape(dateTIme)
            }
            else if (keys.status == "past") {
                strSql += " AND close<=" + db.escape(dateTIme)
            }
        }
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


    static findByStudent(keys) {//filter by date start end kalau end untuk filter yg dah abes.. so ambil yg >= curdate.. curdate amek dari controller
        //id ni dari teacher wajib ada, no reason nk tgk smua
        //staffId : val 
        //status: ongoing/upcoming/past
        var strSql = "SELECT a.* FROM assessment a JOIN assessment_students ast ON a.assessmentId=ast.assessmentId"
        strSql += " WHERE ast.studentId=" + db.escape(keys["studentId"])
        if (keys.hasOwnProperty("status")) {
            var dateTIme = utils.getDateTimeNow()
            if (keys.status == "ongoing") {
                strSql += " AND open<=" + db.escape(dateTIme) + " AND close>" + db.escape(dateTIme)
            }
            else if (keys.status == "upcoming") {
                strSql += " AND open>" + db.escape(dateTIme)
            }
            else if (keys.status == "past") {
                strSql += " AND close<=" + db.escape(dateTIme)
            }
        }
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

    static updateDetails(asObj) {//contain all field in json
        return new Promise(function (resolve, reject) {
            db.query("UPDATE assessment SET title=" + db.escape(asObj.title) + ",description=" + db.escape(asObj.description)
                + ",open=" + db.escape(asObj.open) + ",close=" + db.escape(asObj.close) + ",duration=" + db.escape(asObj.duration)
                + ",subject=" + db.escape(asObj.subject) + " WHERE assessmentId=" + db.escape(asObj.assessmentId),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(result.affectedRows)
                    }
                })
        })
    }

    static getQuestionList(asId) {
        var strsql = "SELECT q.*, asq.mark,'' as count FROM (SELECT qt.questionId as id, qt.questionText as name, qt.topic, ty.label as questionType FROM (SELECT q.questionId,q.questionText, q.questionType ,t.title as topic FROM question q JOIN topic t ON q.topicId=t.topicId) qt JOIN question_type ty ON qt.questionType=ty.qTypeId ) q JOIN assessment_question asq ON q.id=asq.questionId WHERE asq.assessmentId="
            + db.escape(asId) + " UNION SELECT qs.questionSetId as id,qs.name,group_concat(DISTINCT qs.topic) as topic,'' as questionType,asq.mark,asq.count FROM (SELECT qs.questionSetId,qs.name,q.* FROM question_set qs JOIN question_set_item qst ON qs.questionSetId=qst.questionSetId JOIN (SELECT q.questionId, t.title as topic FROM question q JOIN topic t ON q.topicId=t.topicId) q ON qst.questionId=q.questionId) qs JOIN assessment_question_set asq ON qs.questionSetId=asq.questionSetId WHERE asq.assessmentId="
            + db.escape(asId) + " GROUP BY qs.questionSetId";


        return new Promise(function (resolve, reject) {
            db.query(strsql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)))
                }
            });
        })
    }

    static validateQuestion(asId, questionId) {//check if question already in assessment or included in any question set already added in assessment
        var strSql = "SELECT questionId FROM assessment_question WHERE assessmentId=" + db.escape(asId) + " AND questionId=" + db.escape(questionId)
            + " UNION SELECT qst.questionId FROM (SELECT questionSetId FROM assessment_question_set WHERE assessmentId=" + db.escape(asId)
            + ") qsa JOIN question_set_item qst ON qsa.questionSetId=qst.questionSetId WHERE qst.questionId=" + db.escape(questionId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)).length);
                }
            })
        })
    }

    static addQuestion(asid, qsId, mark) {//insert QUESTION bridge
        var strSql = "INSERT INTO assessment_question(assessmentId,questionId,mark) VALUES(" + db.escape(asid)
            + "," + db.escape(qsId) + "," + db.escape(mark) + ")";
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

    static updateQuestion(asid, qsId, mark) {
        var strSql = "UPDATE assessment_question SET mark=" + db.escape(mark) + " WHERE assessmentId=" + db.escape(asid)
            + " AND questionId=" + db.escape(qsId);
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

    static removeQuestion(asid, qsId) {
        var strSql = "DELETE FROM assessment_question WHERE assessmentId=" + db.escape(asid) + " AND questionId=" + db.escape(qsId)
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
    //question set


    static validateQuestionSet(asid, qsId) {//check if question set have any question that are already in the assessment
        var strSql = "SELECT qs.questionId FROM (SELECT questionId FROM question_set_item WHERE questionSetId=" + db.escape(qsId)
            + ") qs INNER JOIN (SELECT questionId FROM assessment_question WHERE assessmentId=" + db.escape(asid)
            + " UNION SELECT qst.questionId FROM (SELECT questionSetId FROM assessment_question_set WHERE assessmentId=" + db.escape(asid)
            + ") qsa JOIN question_set_item qst ON qsa.questionSetId=qst.questionSetId) qa ON qs.questionId = qa.questionId"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)).length);
                }
            })
        })
    }

    static insertQuestionSet(asId, qsId, mark, count) {
        var strSql = "INSERT INTO assessment_question_set (assessmentId,questionSetId,mark,count) VALUES(" + db.escape(asId)
            + "," + db.escape(qsId) + "," + db.escape(mark) + "," + db.escape(count) + ")";
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

    static updateQuestionSet(asid, qsId, mark, count) {
        var strSql = "UPDATE assessment_question_set SET mark=" + db.escape(mark) + ", count=" + db.escape(count)
            + " WHERE assessmentId=" + db.escape(asid) + " AND questionSetId=" + db.escape(qsId)
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

    static removeQuestionSet(asId, qsId) {
        return new Promise(function (resolve, reject) {
            db.query("DELETE FROM assessment_question_set WHERE assessmentId=" + db.escape(asId) + " AND questionSetId=" + db.escape(qsId),
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

    static fetchStudentList(asId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT s.* FROM (SELECT studentId FROM assessment_students WHERE assessmentId=" + db.escape(asId)
                + ") a JOIN (SELECT s.*,c.abbrv as school,c.className,MAX(cs.endDate) AS endDate FROM (SELECT s.studentId,a.name FROM account a JOIN student s ON a.accountId=s.studentId) s JOIN class_student cs ON cs.studentId=s.studentId JOIN (SELECT s.abbrv, c.className, c.classId FROM school s JOIN class c ON s.schoolId=c.schoolId) c ON cs.classId=c.classId GROUP BY cs.studentId) s ON a.studentId=s.studentId"
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

    static removeStudent(asId, studentId) {
        return new Promise(function (resolve, reject) {
            db.query("DELETE FROM assessment_students WHERE assessmentId=" + db.escape(asId) + " AND studentId=" + db.escape(studentId)
                , function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(result.affectedRows)
                    }
                })
        })
    }

    static addStudent(asId, studentId) {
        return new Promise(function (resolve, reject) {
            db.query('INSERT INTO assessment_students (assessmentId,studentId) VALUES(' + db.escape(asId) + ',' + db.escape(studentId) + ')',
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(result.affectedRows)
                    }
                })
        })
    }

    static getAllQuestion(asId) {
        //format should be array of JSON [{questionId:??,mark:??},{questionId:??,mark:??}]
        return new Promise(function (resolve, reject) {
            db.query("SELECT questionId, mark FROM assessment_question WHERE assessmentId=" + db.escape(asId),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(JSON.parse(JSON.stringify(result)))
                    }
                })
        })
    }

    static getAllQuestionWithinSets(asId) {
        //[ { "questionSetId": ?, "count": ?, "mark": ?, "questions": "35,37,39,44" }, {...} .. ]
        var strsql = "SELECT a.questionSetId,a.count,a.mark, GROUP_CONCAT(qs.questionId) AS questions FROM question_set_item qs JOIN (SELECT questionSetId, mark, count FROM assessment_question_set WHERE assessmentId="
            + db.escape(asId) + ") a ON qs.questionSetId=a.questionSetId GROUP BY a.questionSetId;"
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

    static validateStudent(asId, studentId) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT studentId FROM assessment_students WHERE assessmentId=" + db.escape(asId) + " AND studentId=" + db.escape(studentId),
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(JSON.parse(JSON.stringify(result)).length)
                    }
                })
        })
    }


    static checkAssignedQuestion(asId, studentId, rand = true) {
        var strsql = "SELECT questionId,choosenAnswerNo,answerText"
        if (!rand) {
            strsql += ",mark,fullMark,time"
        }
        strsql += " FROM assigned_question WHERE assessmentId=" + db.escape(asId) + " AND studentId=" + db.escape(studentId) + ((rand) ? " ORDER BY RAND();" : "")
        return new Promise(function (resolve, reject) {
            db.query(strsql,
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(JSON.parse(JSON.stringify(result)))
                    }
                })
        })
    }

    static getAssignedQuestionDetails(asId, studentId) {
        return new Promise(function (resolve, reject) {
            db.query("SELECT q.questionId,q.questionText,q.questionType,aq.choosenAnswerNo,aq.answerText, GROUP_CONCAT(qa.attachmentId) as attachmentIds, GROUP_CONCAT(qa.label) as labels FROM question q JOIN assigned_question aq ON q.questionId=aq.questionId LEFT JOIN question_appendix qa ON q.questionId=qa.questionId"
                + " WHERE aq.assessmentId=" + db.escape(asId) + " AND aq.studentId=" + db.escape(studentId) + " GROUP BY q.questionId ORDER BY RAND()",
                function (err, result) {
                    if (err) {
                        reject(err.message)
                    }
                    else {
                        resolve(JSON.parse(JSON.stringify(result)))
                    }
                }
            )
        })
    }

    static assignQuestion(asId, studentId, questionList) {
        var strSql = "INSERT INTO assigned_question (assessmentId,studentId,questionId,fullMark) VALUES "
        questionList.forEach(question => {
            strSql += "(" + db.escape(asId) + "," + db.escape(studentId) + "," + db.escape(question.questionId) + "," + db.escape(question.mark) + "),"
        });
        strSql = strSql.substring(0, strSql.length - 1);
        strSql += " ON DUPLICATE KEY UPDATE fullMark=VALUES(fullMark)";
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(true)
                }
            })
        })
    }

    static startAttempt(asId, studentId, dtStart, dEnd) {//dt start in sql format

        var strSql = "UPDATE assessment_students SET startAttempt=" + db.escape(dtStart) + ", endAttempt=" + db.escape(dEnd) + " WHERE studentId=" + db.escape(studentId) + " AND assessmentId=" + db.escape(asId)

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

    static AttemptTime(asId, studentId) {
        var strSql = "SELECT startAttempt,endAttempt FROM assessment_students WHERE assessmentId=" + db.escape(asId) + " AND studentId=" + db.escape(studentId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result))[0])
                }
            })
        })
    }

    static submitAnswer(ansObj) {
        //ansObj must have
        //assessmentId, studentId(dari token), questionId, questionType,time
        //ansNo for type 0 mcq, or ansText for type 1 st
        //no need validation student participate or not since if not its simply will be 0 affected row faith on login jwt 
        return new Promise(function (resolve, reject) {
            var strSQl = ""
            if (ansObj.questionType == 0) {//mcq
                strSQl = "UPDATE assigned_question SET choosenAnswerNo=" + db.escape(ansObj.ansNo)
                    + ",time=time+" + db.escape(ansObj.time) + "  ,mark = fullMark * COALESCE((SELECT relativeMark / 100 AS relMark FROM question_answer WHERE questionId=" + db.escape(ansObj.questionId)
                    + " AND answerNo=" + db.escape(ansObj.ansNo) + "),0) WHERE assessmentId=" + ansObj.assessmentId
                    + " AND questionId=" + db.escape(ansObj.questionId) + " AND studentId=" + db.escape(ansObj.studentId)
            }
            else if (ansObj.questionType == 1) {//short text
                strSQl = "UPDATE assigned_question SET answerText=" + db.escape(ansObj.ansText)
                    + ",time=time+" + db.escape(ansObj.time) + ",mark = fullMark * COALESCE ((SELECT relativeMark/100 AS relMark FROM question_answer WHERE questionId=" + db.escape(ansObj.questionId)
                    + " AND answerText=" + db.escape(ansObj.ansText) + "),0) WHERE assessmentId=" + db.escape(ansObj.assessmentId)
                    + " AND questionId=" + db.escape(ansObj.questionId) + " AND studentId=" + db.escape(ansObj.studentId)
            }
            else {
                reject("invalid type")
            }
            db.query(strSQl, function (err, result) {
                if (err) {
                    return reject(err.message)
                }
                else {
                    if (result.affectedRows == 0) {
                        return reject('no change')
                    }
                    return resolve(result.affectedRows)
                }
            })

        })
    }

    static finishAttempt(asId, studentId) {
        var strSql = "UPDATE assessment_students SET endAttempt=" + db.escape(utils.getDateTimeNow())
            + " WHERE assessmentId=" + db.escape(asId) + " AND studentId=" + db.escape(studentId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    if (result.affectedRows == 0) {
                        reject('no change')
                    }
                    else {
                        resolve(result.affectedRows)
                    }
                }
            })
        })
    }

    static getSummary(asId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT a.name,c.className,MAX(cs.endDate),sc.abbrv,ast.* FROM student s JOIN account a ON s.studentId=a.accountId JOIN class_student cs ON s.studentId = cs.studentId JOIN class c ON c.classId=cs.classId JOIN school sc ON c.schoolId=sc.schoolId JOIN (SELECT ast.startAttempt, ast.endAttempt,t.* FROM (SELECT studentId, startAttempt, endAttempt FROM assessment_students "
                + " WHERE assessmentId=" + db.escape(asId) + ") ast JOIN (SELECT studentId, SUM(mark) AS totalMark, SUM(time) AS time FROM assigned_question WHERE assessmentId=" + db.escape(asId)
                + " GROUP BY studentId) t ON ast.studentId=t.studentId ) ast ON s.studentId=ast.studentId GROUP BY s.studentId"

            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        reject('not found')
                    }
                    else {
                        resolve(result)
                    }
                }
            })
        })
    }

    saveGrading() {
        var strSql = "UPDATE assessment SET grading=" + db.escape(this.grading) + " WHERE assessmentId=" + db.escape(this.assessmentId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    if (result.affectedRows == 0) {
                        reject('nochanged')
                    }
                    else {
                        resolve()
                    }
                }
            })
        })
    }



    getAllAssignedQuestion(studentId = null) {
        var strSql = "SELECT DISTINCT questionId FROM assigned_question WHERE assessmentId=" + db.escape(this.assessmentId)
        if (studentId) {
            strSql += " AND studentId=" + db.escape(studentId)
        }
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        reject('norecord')
                    }
                    else {
                        resolve(result)
                    }
                }
            })
        })
    }

    getQAAanalysis() {
        var strSql = "SELECT a.name,a.accountId,asq.questionId,asq.mark,asq.fullMark,asq.time FROM account a JOIN assigned_question asq ON a.accountId=asq.studentId"
            + " WHERE asq.assessmentId=" + db.escape(this.assessmentId)
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

    static getSchoolReport(schoolId, subjectCode, year) {
        let sDt, eDt;
        sDt = year + '-01-01'
        eDt = year + '-12-31'
        var strSql = "SELECT (SUM(aq.mark) / SUM(aq.fullMark)) AS percent, CAST(a.close AS DATE) AS date,ads.areaId,aa.areaName  FROM assessment a JOIN assigned_question aq ON a.assessmentId=aq.assessmentId JOIN class_student cs ON aq.studentId=cs.studentId JOIN class c ON cs.classId=c.classId JOIN address ads ON aq.studentId=ads.accountId JOIN area aa ON ads.areaId=aa.areaId"
            + " WHERE a.open >= " + db.escape(sDt) + " AND a.close <= " + db.escape(eDt) + " AND c.schoolId=" + db.escape(schoolId) + " AND a.subject=" + db.escape(subjectCode)
            + " AND cs.startDate < a.close AND cs.endDate >= a.close GROUP BY a.assessmentId, ads.areaId ORDER BY a.close ASC"
        console.log(strSql)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        reject('no data')
                    }
                    else {
                        resolve(result)
                    }
                }
            })
        })
    }

    static getAreaReport(areaId, subjectCode, year) {//areaId,subjectId,year string
        let sDt, eDt;
        sDt = year + '-01-01'
        eDt = year + '-12-31'
        //for now average kalau ada assessment same date, later bole max min
        var strSql = "SELECT AVG(a.percent) as percent, date FROM (SELECT (SUM(aq.mark) / SUM(aq.fullMark)) AS percent, CAST(a.close AS DATE) As date FROM assigned_question aq JOIN assessment a ON aq.assessmentId=a.assessmentId JOIN address ad ON aq.studentId=ad.accountId"
            + " WHERE a.open >= " + db.escape(sDt) + " AND a.close <= " + db.escape(eDt) + " AND ad.areaId =" + db.escape(areaId) + " AND a.subject= " + db.escape(subjectCode) + " GROUP BY aq.assessmentId ORDER BY a.close ASC)  a GROUP BY a.date"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 0) {
                        reject('no data')
                    }
                    else {
                        resolve(result)
                    }
                }

            })
        })

    }
}