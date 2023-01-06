const express = require("express");
const router = express.Router();
const Question = require("../Model/entity/question/Question")
const QuestionAnswer = require("../Model/entity/question/QuestionAnswer");
const Attachment = require("../Model/entity/question/Attachment")
const Validator = require("../Controller/Middleware/Validator")
const fileUpload = require("express-fileupload")
const fileUploadValidator = require("./Middleware/fileUploadValidator")
const path = require("path")
const Utils = require("./Utils");
const fs = require('fs');
const attachmentPath = path.join(__dirname, "../View/Res/images/attachment");
const Auth = require("../Controller/Middleware/Authenticate")


router.post('/test', function (req, res) {
})

router.post('/', [
    Auth.userType([2]),
    Validator.checkNumber("intTopicId", "invalid topic Id"),
    Validator.checkNumber("intQuestionType", "invalid question type"),
    Validator.checkString("strQuestionText", { min: 3 }, "question text must be included"),
    Validator.validate()
], function (req, res) {
    req.body["strCreatorId"] = req.user.id;//temporary later get from jwt
    var newQuestion = new Question(req.body);
    newQuestion.setStrDateCreate(Utils.getDateNow())
    newQuestion.insertToDb().then(function (value) {
        return res.status(200).send({ success: value })
    }).catch(function (value) {
        console.log(value)
        return res.status(500).send({ error: value })
    })

})
router.get('/', function (req, res) {
    var id = req.query.id;
    if (!id || id < 0) {
        return res.status(400).send("invalid id");
    }
    Question.loadFromDb(id).then(function (foundQuestion) {
        return res.status(200).send(foundQuestion.toJSON());
    }).catch(function (value) {
        return res.status(500).send("not found: " + value);
    })
})
router.patch('/', [
    Validator.checkString("strQuestionText", { min: 3 }, "question text must be included"),
    Validator.validate()
], function (req, res) {
    var id = req.query.id;
    if (!id || id < 0) {
        return res.status(400).send("invalid id");
    }
    var updateQuestion = new Question({
        intQuestionId: id,
        strQuestionText: req.body.strQuestionText
    })
    updateQuestion.update().then(function (value) {
        return res.status(200).send()
    }).catch(function (value) {
        return res.status(500).send(value)
    })
})

router.delete('/', function (req, res) {
    var id = req.query.id;
    if (!id || id < 0) {
        return res.status(400).send("invalid id");
    }
    var delQ = new Question({ intQuestionId: id });
    delQ.deleteThis().then(function (value) {
        return res.status(200).send()
    }).catch(function (value) {
        return res.status(500).send()
    })

})


router.post('/answer',
    [
        Validator.checkNumber("intQuestionId", "Question Id must be included"),
        Validator.checkString("strAnswerText", "Answer text must be included"),
        Validator.checkNumber("dblRelativeMark", { min: 0, max: 100 }, "relative mark must be between 0 ~ 100"),
        Validator.validate()
    ]
    , async function (req, res) {//within same question   
        var newAnsNo = await QuestionAnswer.getNewAnswerNo({
            "intQuestionId": req.body[0]["intQuestionId"]
        })
        console.log(newAnsNo)
        QuestionAnswer.bulkInsert(newAnsNo, req.body).then(function (value) {
            return res.status(200).send();
        }).catch(function (value) {
            return res.status(500).send();
        })
    })

router.patch('/answer',
    [
        Validator.checkNumber("intQuestionId", "Question Id must be included"),
        Validator.checkString("strAnswerText", "Answer text must be included"),
        Validator.checkNumber("dblRelativeMark", { min: 0, max: 100 }, "relative mark must be between 0 ~ 100"),
        Validator.validate()
    ]
    , async function (req, res) {
        var newAnsNo = await QuestionAnswer.getNewAnswerNo({
            "intQuestionId": req.body[0]["intQuestionId"]
        })
        req.body.forEach(ansObj => {
            if (!ansObj.hasOwnProperty("intAnswerNo")) {
                ansObj["intAnswerNo"] = newAnsNo;
                newAnsNo++;
            }
        })
        console.log(req.body)
        QuestionAnswer.bulkUpdate(req.body).then(function (value) {
            return res.status(200).send(value)
        }).catch(function (value) {
            return res.status(500).send(value)
        })
    })

router.delete('/answer', function (req, res) {
    var questionId = req.query.questionId;
    if (!questionId || questionId < 0) {
        return res.status(400).send("invalid question id");
    }
    var answerNo = req.query.answerNo;
    if (!answerNo || answerNo < 0) {
        return res.status(400).send("invalid answer No id");
    }

    var delAns = new QuestionAnswer({
        "intQuestionId": questionId,
        "intAnswerNo": answerNo
    })
    delAns.deleteThis().then(function (value) {
        return res.status(200).send();
    }).catch(function (value) {
        return res.status(500).send(value)
    })


})

router.get('/answer', function (req, res) {//provide id of question
    var id = req.query.id;
    if (!id || id < 0) {
        return res.status(400).send("invalid id");
    }
    QuestionAnswer.getAllAnswers(id).then(function (foundAnswers) {
        return res.status(200).send(foundAnswers);
    }).catch(function (value) {
        return res.status(400).send(value)
    })

})

router.post('/getTopicBySubject', function (req, res) {
    Question.tmpGetTopicBySub(req.body.subjectId).then(
        function (value) {
            return res.status(200).send(value);
        }
    ).catch(function (value) {
        return res.status(500).send(value);
    })
})


router.post('/addQuestionAttachment', function (req, res) {
    var targetQuestion = new Question();
    targetQuestion.setIntQuestionId(req.body.intQuestionId)
    targetQuestion.addAttachments(req.body.attachments).then(function (value) {
        return res.status(200).send(value)
    }).catch(function (value) {
        return res.status(500).send(value)
    })
})

router.get('/find',
    Auth.userType([2])
    , function (req, res) {
        //dStart,dEnd,subjectCode,topicId,questionType
        var dStart = req.query.dStart;
        var dEnd = req.query.dEnd;
        if (!dStart || !dEnd) {
            return res.status(400).send("insuffiecient field")
        }
        var searchKeys = {}
        searchKeys["dStart"] = Utils.dateToSQldate(dStart)
        searchKeys["dEnd"] = Utils.dateToSQldate(dEnd)
        if (req.query.subjectCode) {
            console.log(req.query.subjectCode)
            searchKeys["subjectCode"] = req.query.subjectCode
        }
        if (req.query.topicId) {
            if (!req.query.subjectCode) {
                return res.status(400).send("Must specify subject to filter by topic")
            }
            searchKeys["topicId"] = req.query.topicId
        }
        if (req.query.questionType) {
            searchKeys["questionType"] = req.query.questionType
        }
        if (req.query.owner) {
            searchKeys["creatorId"] = req.user.id  //later ambil dari req jwt //must login lah
        }
        Question.findQuestion(searchKeys).then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            return res.status(500).send(err)
        })


    })


router.get('/attachmentList', function (req, res) {
    var id = req.query.id;
    if (!id || id < 0) {
        return res.status(400).send("invalid id");
    }
    Question.getAttachmentList(id).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (value) {
        return res.status(500).send(value);
    })

})

router.post('/uploadAttachment', [
    fileUpload({ createParentPath: true }),
    fileUploadValidator.fileExist(),
    fileUploadValidator.maxMbSize(5),
    fileUploadValidator.checkExtension(['.jpg', '.png', '.jpeg'])

]
    , function (req, res) {
        new Promise(function (resolve, reject) {
            const files = req.files;
            var newAttachment = new Attachment()
            var counter = 1;
            var max = Object.keys(files).length;
            var uploadedArr = []
            Object.keys(files).forEach(key => {
                newAttachment.setStrName(key);
                newAttachment.insertIntoDb().then(function (value) {
                    var fpath = path.join(__dirname, "../View/Res/images/attachment", value + ".png");
                    files[key].mv(fpath, (err) => {
                        if (err) reject("error writing file");
                    })
                    uploadedArr.push({ "id": value, "fname": files[key].name });
                    if (counter == max) {
                        resolve(uploadedArr);
                    }
                    counter++;
                }).catch(function (value) {
                    reject("database error: " + value)
                })
            })
        }).then(function (value) {
            return res.status(200).send(value)
        }).catch(function (value) {
            return res.status(500).send({ error: value })
        })
    })

router.post("/attachment/upload", [
    fileUpload({ createParentPath: true }),
    fileUploadValidator.fileExist(),
    fileUploadValidator.maxMbSize(5),
    fileUploadValidator.checkExtension(['.jpg', '.png', '.jpeg'])
], function (req, res) {
    const files = req.files;
    var newAttachment = new Attachment()
    var counter = 1;
    var max = Object.keys(files).length;
    var uploadedArr = []
    Object.keys(files).forEach(key => {
        newAttachment.setStrName(key);
        newAttachment.insertIntoDb().then(function (value) {
            var fpath = path.join(attachmentPath, value + ".png");
            files[key].mv(fpath, (err) => {
                if (err) return res.status(500).send(err)
            })
            uploadedArr.push({ "id": value, "fname": newAttachment.getStrName() });
            if (counter == max) {
                return res.status(200).send(uploadedArr)
            }
            counter++;
        }).catch(function (value) {
            return res.status(500).send(value)
        })
    })
})

router.get("/attachment/delete", function (req, res) {
    Attachment.loadFromDb(req.query.intAttachmentId).then(function (foundFile) {

        foundFile.deleteThis().then(function (value) {
            res.status(200).send()
        }).catch(function (value) {
            res.status(500).send()
        })

        var fpath = path.join(attachmentPath, foundFile.getIntAttachmentId().toString() + ".png")
        fs.unlinkSync(fpath)
        return;
    }).catch(function (value) {
        return res.status(500).send(value);
    })
    return;
})

router.get("/detail", function (req, res) {
    var questionId = req.query.questionId;
    if (!questionId) {
        return res.status(400).send()
    }
    Question.questionDetail(questionId).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send(err)
    })

})

router.get("/setId", function (req, res) {
    var setId = req.query.questionSetId;
    if (!setId) {
        return res.status(400).send()
    }
    Question.findQuestionInSet(setId).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})


module.exports = router; 