const express = require('express');
const router = express.Router();
const path = require('path');
const Address = require('../Model/address');
const ViewDir = path.join(__dirname, '../View/Pages');
const QuestionType = require("../Model/entity/question/QuestionType")
const Subject = require("../Model/entity/Subject")
const Auth = require("./Middleware/Authenticate")
const Assessment = require("../Model/entity/assessment/Assessment")
const AssessmentController = require('./assessmentController');
const QuestionAnswer = require('../Model/entity/question/QuestionAnswer');
//ni folder handle routes page request
//page kita ni in form of fragment je x full page
//front end SPA script ak yg akan load kan ke dlm page nanti
//for now send file je, in future ak akan securekan route2 ni



//home page
router.get('/home', Auth.userType(), function (req, res) {
    return res.sendFile(ViewDir + "\\home.html");
})


//users page
router.get('/profile', Auth.userType(), async function (req, res) {
    var statesdata = await Address.getState();
    return res.render("profile.ejs", {
        states: statesdata
    });
})
router.get('/teacher', Auth.userType([2, 3]), async function (req, res) {
    var statesdata = await Address.getState();
    return res.render("teacher.ejs", {
        states: statesdata
    });
})
router.get('/student', Auth.userType([2, 3]), async function (req, res) {
    var statesdata = await Address.getState();
    return res.render("student.ejs", {
        states: statesdata
    });
})

//school & class
router.get('/school', function (req, res) {
    return res.sendFile(ViewDir + "\\school.html");
})
router.get('/class', function (req, res) {
    return res.sendFile(ViewDir + "\\class.html");
})

//subject & topic
router.get('/subject', function (req, res) {
    return res.sendFile(ViewDir + "\\subject.html");
})
router.get('/topic', function (req, res) {
    return res.sendFile(ViewDir + "\\topic.html");
})

//assessment pages
router.get('/assessment', async function (req, res) {
    var subjects = await Subject.getAll()
    var answerType = await QuestionType.getAll();
    return res.render("assessment.ejs",
        {
            ansType: answerType,
            subjects: subjects
        })
})
router.get('/pastAssessment', async function (req, res) {
    return res.render("assessment_Past.ejs")
})

router.get('/assessment_attempt', Auth.userType([1]), async function (req, res) {
    if (!req.query.asId) {
        return res.status(400).send()
    }
    var As = new Assessment()
    As.assessmentId = req.query.asId;
    As = await As.load().catch(function (err) {
        return res.status(400).send({ error: err })
    })
    var ASC = new AssessmentController(req.query.asId, req.user.id);
    var stats = await ASC.checkStatus();
    if (stats == -1) {
        return res.status(401).send({ error: 'closed' })
    }
    else if (stats == 1) {
        return res.status(401).send({ error: 'assessment not started yet' })
    }
    var participate = await ASC.checkIsParticipant()
    if (!participate) {
        return res.status(401).send()
    }
    var time = await Assessment.AttemptTime(req.query.asId, req.user.id).catch(function (err) {
        console.log(err)
    })
    var dtnow = new Date()
    var dtEnd = new Date(time.endAttempt)
    if (!time.startAttempt) {
        return res.status(401).send({ error: "no attempt started yet" })
    }
    if (dtnow.getTime() >= dtEnd.getTime()) {
        return res.status(401).send({ error: "Attempt Time ended" })
    }
    time.realEnd = time.endAttempt
    time.startAttempt = new Date(time.startAttempt).toLocaleString()
    time.endAttempt = new Date(time.endAttempt).toLocaleString()
    // time.startAttempt = tstart.toLocaleDateString() + " " + tstart.toLocaleTimeString()
    //time.endAttempt = tend.toLocaleDateString() + " " + tend.toLocaleTimeString() 
    var assignedQuestion = await Assessment.getAssignedQuestionDetails(req.query.asId, req.user.id).catch(function (err) {
        console.log(err)
    })
    if (assignedQuestion.length == 0) {
        return res.status(401).send({ error: "no question assigned, please try again" })
    }
    var mcqIds = []
    assignedQuestion.forEach(q => {
        if (q.questionType == 0) {
            mcqIds.push(q.questionId)
        }
    });

    var answers = []
    answers = await QuestionAnswer.fetchAnswerChoice(mcqIds).catch(function (err) { console.log(err) })
    if (answers) {
        answers.forEach(ans => {
            assignedQuestion.forEach(asg => {
                if (ans.questionId == asg.questionId) {
                    delete ans.questionId
                    if (!asg.hasOwnProperty('answer')) {
                        asg.answer = []
                    }
                    asg.answer.push(ans)
                }
            })
        })
    }
    return res.render("assessment_attempt.ejs", {
        student: req.user,
        assessment: As[0],
        atTime: time,
        questions: assignedQuestion
    })
})

router.get('/assessmentIReport', Auth.userType([1, 2]), async function (req, res) {
    console.log(req.query)
    if (!req.query.asid || !req.query.sid) {//assessment id, student id
        return res.status(400).send()
    }
    var studentId = req.query.sid
    if (req.user.type == 1) {
        if (req.query.sid == "me") {
            studentId = req.user.id
        }
        else if (req.user.id != req.query.sid) {
            return res.status(401).send()//student xle acccess report student lain
        }
    }
    console.log('sni')
    var errormsg = ""
    var As = new Assessment()
    As.assessmentId = req.query.asid;
    var dataAs = await As.load().catch(function (err) {
        errormsg = err
    })
    console.log('sni')
    if (!dataAs) {
        return res.status(400).send({ error: errormsg })
    }
    console.log('sni')
    var totalMark = await As.totalFullMark().catch(function (err) {
        errormsg = err
    })
    if (!totalMark) {
        return res.status(400).send({ error: errormsg })
    }
    console.log('sni')

    var asq = await As.getAllAssignedQuestion(studentId).catch(function (err) {
        console.log(err)
        errormsg = err
    })
    if (!asq) {
        return res.status(400).send({ error: errormsg })
    }
    return res.render('assessment_report_student.ejs', {
        assessment: dataAs[0],
        tMark: totalMark,
        assignedQuestion: asq
    })
})

router.get('/assessmentReport', Auth.userType([2]), async function (req, res) {
    if (!req.query.asId) {
        return res.status(400).send()
    }
    var errormsg = ""
    var As = new Assessment()
    As.assessmentId = req.query.asId;
    var dataAs = await As.load().catch(function (err) {
        errormsg = err
    })
    if (!dataAs) {

        return res.status(400).send({ error: errormsg })
    }
    var totalMark = await As.totalFullMark().catch(function (err) {
        errormsg = err
    })
    if (!totalMark) {
        return res.status(400).send({ error: errormsg })
    }

    var asq = await As.getAllAssignedQuestion().catch(function (err) {
        console.log(err)
        errormsg = err
    })
    if (!asq) {
        return res.status(400).send({ error: errormsg })
    }
    return res.render("assessment_report.ejs", {
        assessment: dataAs[0],
        tMark: totalMark,
        assignedQuestion: asq
    })
})


//question bank
router.get('/findQuestion', Auth.userType([2, 3]), async function (req, res) {
    var subjects = await Subject.getAll()
    var answerType = await QuestionType.getAll();
    return res.render("findQuestion.ejs",
        {
            ansType: answerType,
            subjects: subjects
        })
})
router.get('/questionBank', Auth.userType([2, 3]), async function (req, res) {
    var subjects = await Subject.getAll()
    var answerType = await QuestionType.getAll();
    return res.render("questionBank.ejs",
        {
            ansType: answerType,
            subjects: subjects
        })
})
router.get('/questionCreate', Auth.userType([2, 3]), async function (req, res) {
    var subjects = await Subject.getAll()
    var answerType = await QuestionType.getAll();

    return res.render("questionCreate.ejs",
        {
            ansType: answerType,
            subjects: subjects
        })
})

router.get('/attachment', function (req, res) {
    return res.sendFile(ViewDir + "\\attachment.html");
})

//reports
router.get('/reportAssessment', function (req, res) {
    return res.sendFile(ViewDir + "\\reportAssessment_old.html")
})



module.exports = router;