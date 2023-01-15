const express = require('express');
const router = express.Router();
const Assessment = require("../Model/entity/assessment/Assessment")
const Validator = require("./Middleware/Validator")
const Auth = require("./Middleware/Authenticate");
const QuestionSet = require('../Model/entity/question/QuestionSet');
const AssessmentController = require("./assessmentController")
const utils = require("./Utils");


router.post('/test'
    , function (req, res) {
        console.log(req.body)

    })


router.post('/', [
    Auth.userType([2, 3]),
    Validator.checkString("title", { min: 5 }),
    Validator.checkString("description", { min: 5 }),
    Validator.checkString("open"),
    Validator.checkString("close"),
    Validator.checkNumber("duration", { min: 1 }),
    Validator.checkString("subject"),
    Validator.validate()
], function (req, res) {
    var newAs = new Assessment();
    newAs.title = req.body.title
    newAs.description = req.body.description
    newAs.open = req.body.open
    newAs.close = req.body.close
    newAs.duration = req.body.duration
    newAs.subject = req.body.subject
    newAs.createNew().then(function (result) {
        return res.status(200).send({ createdId: result })
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})

router.post('/staff', [
    Auth.userType([2, 3]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkString("staffId"),
    Validator.validate()
]
    , function (req, res) {
        console.log(req.body)
        if (req.body.staffId == "me") {
            console.log(req.user)
            if (!req.user) {
                return res.status(400).send()
            }
            else {
                req.body.staffId = req.user.id
            }
        }
        Assessment.addStaff(req.body.assessmentId, req.body.staffId).then(function (result) {
            return res.status(200).send()
        }).catch(function (err) {
            return res.status(500).send(err)
        })
    })

router.get('/staff',
    [Auth.userType([1, 2, 3])
    ], function (req, res) {
        var assessmentId = req.query.assessmentId;
        if (!assessmentId || assessmentId < 0) {
            return res.status(400).send("invalid assessment id");
        }
        Assessment.fetchStaffList(assessmentId).then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            return res.status(500).send({ error: err })
        })
    })

router.delete('/staff', [
    Auth.userType(Auth.userType([2, 3])),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkString("staffId"),
    Validator.validate()],
    async function (req, res) {
        var curAs = new Assessment({ "assessmentId": req.body.assessmentId });
        var staffCount = await curAs.checkStaffCount();
        if (staffCount <= 1) { //kalau tinggal 1 padam je assessment xde sape handle da
            curAs.deleteThis().then(function (result) {
                return res.status(200).send({ deleted: "assessment" });
            }).catch(function (err) {
                return res.status(500).send({ error: err })
            })
        }
        else {
            curAs.removeStaff(req.body.staffId).then(function (result) {
                return res.status(200).send({ deleted: "staff" });
            }).catch(function (err) {
                return res.status(500).send({ error: err })
            })
        }
    })

router.get('/',
    Auth.userType()
    , function (req, res) {
        var qstatus = ""
        if (req.query.status) {
            qstatus = req.query.status
        }
        console.log(qstatus)
        //console.log(req.user)
        if (req.user.type == 2) {//staff
            Assessment.findByStaff({ staffId: req.user.id, status: qstatus }).then(function (result) {
                return res.status(200).send(result)
            }).catch(function (err) {
                return res.status(500).send(err)
            })
        }
        else if (req.user.type == 1) {//student
            Assessment.findByStudent({ studentId: req.user.id, status: qstatus }).then(function (result) {
                return res.status(200).send(result)
            }).catch(function (err) {
                return res.status(500).send(err)
            })

        }
        else {
            return res.status(404).send()
        }
    })

router.patch('/', [
    Auth.userType([2, 3]),
    Validator.checkNumber("assessmentId", { min: 1 }),
    Validator.checkString("title", { min: 5 }),
    Validator.checkString("description", { min: 5 }),
    Validator.checkString("open"),
    Validator.checkString("close"),
    Validator.checkNumber("duration", { min: 1 }),
    Validator.checkString("subject"),
    Validator.validate()
], function (req, res) {
    Assessment.updateDetails(req.body).then(function (result) {
        return res.status(200).send({ changed: result })
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})


router.delete('/', [
    Auth.userType([2, 3])
], function (req, res) {
    var id = req.query.id;
    if (!id || id < 0) {
        return res.status(400).send("invalid id");
    }
    var asm = new Assessment()
    asm.assessmentId = req.query.id
    asm.deleteThis().then(function (result) {
        return res.status(200).send()
    }).catch(function (err) {
        return res.status(500).send(err);
    })
})

router.get('/questionList',
    Auth.userType()
    , function (req, res) {
        if (!req.query.asId) {
            return res.status(400).send()
        }
        Assessment.getQuestionList(req.query.asId).then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            return res.status(500).send(err)
        })
    })

//listings
router.post('/Question', [
    Auth.userType([2, 3]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkNumber("questionId", { min: 0 }),
    Validator.checkNumber("mark", { min: 1 }, "must be at least 1"),
    Validator.validate()
], async function (req, res) {
    var check = await Assessment.validateQuestion(req.body.assessmentId, req.body.questionId);
    console.log(check)
    if (check == 0) {//question doesnt exist in current question list or questio set list of the assessment
        Assessment.addQuestion(req.body.assessmentId, req.body.questionId, req.body.mark).then(function (result) {
            return res.status(200).send({ affected: result });
        }).catch(function (err) {
            return res.status(500).send({ error: err });
        })
    }
    else {
        return res.status(400).send({ duplicate: "question is already included in the assessment" })
    }
})

router.patch('/Question', [
    Auth.userType([2, 3]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkNumber("questionId", { min: 0 }),
    Validator.checkNumber("mark", { min: 1 }, "must be at least 1"),
    Validator.validate()
], function (req, res) {
    Assessment.updateQuestion(req.body.assessmentId, req.body.questionId, req.body.mark).then(function (result) {
        return res.status(200).send({ affected: result })
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})

router.delete('/Question', [
    Auth.userType([2, 3]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkNumber("questionId", { min: 0 }),
    Validator.validate()
], function (req, res) {
    Assessment.removeQuestion(req.body.assessmentId, req.body.questionId).then(function (result) {
        return res.status(200).send({ affected: result })
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})

//question set 
router.post('/QuestionSet', [
    Auth.userType([2, 3]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkNumber("questionSetId", { min: 0 }),
    Validator.checkNumber("mark", { min: 1 }, "must be at least 1"),
    Validator.checkNumber("count", { min: 1 }, "must be at least 1"),
    Validator.validate()
], async function (req, res) {
    var check = await Assessment.validateQuestionSet(req.body.assessmentId, req.body.questionSetId);
    if (check == 0) {
        var questionSetMax = await QuestionSet.getQuestionCount(req.body.questionSetId);
        if (questionSetMax < req.body.count) {
            return res.status(400).send({ error: "count cannot exceed number of question in set" });
        }
        else {
            Assessment.insertQuestionSet(req.body.assessmentId, req.body.questionSetId, req.body.mark, req.body.count).then(
                function (result) {
                    return res.status(200).send({ affected: result })
                }
            ).catch(function (err) {
                return res.status(500).send({ error: err })
            })
        }
    }
    else {
        return res.status(400).send({ duplicate: "Question set contains question that already exist in the assessment" })
    }
})

router.patch('/QuestionSet', [
    Auth.userType([2, 3]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkNumber("questionSetId", { min: 0 }),
    Validator.checkNumber("mark", { min: 1 }, "must be at least 1"),
    Validator.checkNumber("count", { min: 1 }, "must be at least 1"),
    Validator.validate()
], async function (req, res) {
    var questionSetMax = await QuestionSet.getQuestionCount(req.body.questionSetId);
    if (questionSetMax < req.body.count) {
        return res.status(400).send({ validationError: { count: "cannot exceed number of question in the set" } })
    }
    Assessment.updateQuestionSet(req.body.assessmentId, req.body.questionSetId, req.body.mark, req.body.count).then(
        function (result) {
            return res.status(200).send({ affected: result })
        }
    ).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})

router.delete('/QuestionSet', [
    Auth.userType([2, 3]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkNumber("questionSetId", { min: 0 }),
    Validator.validate()
], function (req, res) {
    Assessment.removeQuestionSet(req.body.assessmentId, req.body.questionSetId).then(function (result) {
        return res.status(200).send({ affected: result })
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})

router.get('/student',
    Auth.userType()
    , function (req, res) {
        if (!req.query.asId) {
            return res.status(400).send()
        }
        console.log(req.query.asId)
        Assessment.fetchStudentList(req.query.asId).then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            return res.status(500).send(err)
        })
    })
router.get('/student/finished',
    [Auth.userType([2, 3])]
    , function (req, res) {
        if (!req.query.asId) {
            return res.status(400).send()
        }
        Assessment.finishedStudent(req.query.asId).then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            returnres.status(500).send({ error: err })
        })
    })

router.post('/student', [
    Auth.userType([2, 3]),
    Validator.checkNumber('assessmentId', { min: 0 }),
    Validator.checkString('studentId', { min: 12, max: 12 }),
    Validator.validate()
], function (req, res) {
    Assessment.addStudent(req.body.assessmentId, req.body.studentId).then(function (result) {
        return res.status(200).send({ affected: result })
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })

})

router.delete('/student', [
    Auth.userType([2, 3]),
    Validator.checkNumber('assessmentId', { min: 0 }),
    Validator.checkString('studentId', { min: 12, max: 12 }),
    Validator.validate()
], function (req, res) {
    Assessment.removeStudent(req.body.assessmentId, req.body.studentId).then(function (result) {
        return res.status(200).send({ affected: result })
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})



router.post('/startAttempt', [
    Auth.userType([1]),
    Validator.checkNumber('assessmentId', { min: 0 }),
    Validator.validate()
], async function (req, res) {
    console.log('s')
    var as = new AssessmentController(req.body.assessmentId, req.user.id)
    var stats = await as.checkStatus();
    if (stats == -1) {
        return res.status(401).send({ error: 'closed' })
    }
    else if (stats == 1) {
        return res.status(401).send({ error: 'assessment not started yet' })
    }
    var participate = await as.checkIsParticipant()
    if (participate) {
        var assignedQuestion = await as.checkAssignedQuestion();
        if (assignedQuestion.length < 1) {
            await as.assignQuestion()
            await as.startAttempt()
        }
        return res.status(200).send()//gooo
    }
    else {
        return res.status(401).send()
    }
})


router.post('/submit', [
    Auth.userType([1]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkNumber("questionId", { min: 0 }),
    Validator.checkNumber("questionType", { min: 0 }),
    Validator.checkNumber("time", { min: 0 }),
    Validator.validate()
]
    , function (req, res) {

        //ansObj must have
        //assessmentId, studentId(dari token), questionId, questionType
        //ansNo for type 0 mcq, or ansText for type 1 st 
        if (req.body.questionType == 0) {
            if (!req.body.ansNo) {
                return res.status(400).send({ error: "invalid answer" })
            }
        }
        else if (req.body.questionType == 1) {
            if (!req.body.ansText) {
                return res.status(400).send({ error: "invalid answer" })
            }
        }
        else {
            return res.status(400).send({ error: "invalid type" })
        }
        req.body['studentId'] = req.user.id
        Assessment.submitAnswer(req.body).then(function (result) {
            return res.status(200).send()
        }).catch(function (err) {
            return res.status(500).send({ error: err })
        })

    })

router.post('/finishAttempt', [
    Auth.userType([1]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.validate()
], function (req, res) {
    Assessment.finishAttempt(req.body.assessmentId, req.user.id).then(function (result) {
        return res.status(200).send({ changed: result })
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})

router.get('/summary', [
    Auth.userType([2, 3])
], function (req, res) {
    if (!req.query.id) {
        return res.status(400).send()
    }
    Assessment.getSummary(req.query.id).then(function (result) {
        return res.status(200).send(result)

    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})

router.post('/grade', [
    Auth.userType([2, 3]),
    Validator.checkNumber("assessmentId", { min: 0 }),
    Validator.checkNumber("fullMark", { min: 1 }),
    Validator.validate()
], function (req, res) {
    if (!req.body.range) {
        return res.status(400).send()
    }
    if (!validateGrade(req.body.range)) {
        return res.status(400).send()
    }
    var as = new Assessment()
    as.assessmentId = req.body.assessmentId
    as.grading = JSON.stringify(req.body.range)
    /*  req.body.range.forEach(r => {
          r.start = r.start / 100;
          r.end = r.end / 100;
      });*/
    as.saveGrading().then(function (result) {
        return res.status(200).send()
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })

})

router.get('/assignedQuestion', [
    Auth.userType()
], function (req, res) {
    if (!req.query.sid || !req.query.asid) {
        return res.status(400).send()
    }
    if (req.query.sid == "me") {
        req.query.sid = req.user.id
    }
    console.log(req.query.sid)
    console.log(req.query.asid)
    Assessment.checkAssignedQuestion(req.query.asid, req.query.sid, false).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        console.log(err)
        return res.status(500).send({ error: err })
    })

})


function validateGrade(r) {
    var tmpArr = []

    for (var i = 0; i < r.length; i++) {
        if (tmpArr.includes(r[i].start)) {
            return false
        }
        if (tmpArr.includes(r[i].end)) {
            return false
        }
        tmpArr.push(r[i].start)
        tmpArr.push(r[i].end)
    }
    for (var i = 0; i < tmpArr.length; i++) {

        if (tmpArr[i] == 100 || tmpArr[i] == 0) {
            //0 100 no need check memang xde + - 1 ujung
            continue
        }
        if (!tmpArr.includes(tmpArr[i] + 1) && !tmpArr.includes(tmpArr[i] - 1)) {
            return false //kalau start mesti ada end yang -1, kalau end mesti ada start yang +1
            //ensure all number can fall within specified range
        }
    }
    return true
}

router.get('/QAanalysis',
    Auth.userType([2, 3])
    , function (req, res) {
        if (!req.query.asId) {
            return res.status(400).send()
        }
        var As = new Assessment()
        As.assessmentId = req.query.asId
        As.getQAAanalysis().then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            return res.status(500).send({ error: err })
        })
    })

router.get('/report/area', function (req, res) {
    if (!req.query.areaId) {
        return res.status(400).send({ validationError: { areaId: 'invalid' } })
    }
    if (!req.query.subjCode) {
        return res.status(400).send({ validationError: { subjectCode: 'invalid' } })
    }
    if (!req.query.year) {
        return res.status(400).send({ validationError: { year: 'invalid' } })
    }
    Assessment.getAreaReport(req.query.areaId, req.query.subjCode, req.query.year).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        console.log(err)
        return res.status(500).send({ error: err })
    })
})

router.get('/report/individual', function (req, res) {
    if (!req.query.studentId) {
        return res.status(400).send({ validationError: { studentId: 'invalid' } })
    }
    if (!req.query.subjCode) {
        return res.status(400).send({ validationError: { subjectCode: 'invalid' } })
    }
    if (!req.query.year) {
        return res.status(400).send({ validationError: { year: 'invalid' } })
    }
    Assessment.individualReport(req.query.studentId, req.query.subjCode, req.query.year).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })

})

router.get('/report/school', function (req, res) {
    if (!req.query.schoolId) {
        return res.status(400).send({ validationError: { schoolId: 'invalid school id' } })
    }
    if (!req.query.subjCode) {
        return res.status(400).send({ validationError: { subjCode: 'invalid' } })
    }
    if (!req.query.year) {
        return res.status(400).send({ validationError: { year: 'invalid' } })
    }
    let split = true
    if (req.query.split) {
        split = !(req.query.split == "false")
    }
    Assessment.getSchoolReport(req.query.schoolId, req.query.subjCode, req.query.year, split).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})
module.exports = router;