const express = require("express");
const router = express.Router();
const Validator = require("./Middleware/Validator")
const QuestionSet = require("../Model/entity/question/QuestionSet")
const Auth = require("./Middleware/Authenticate")

router.post("/", [
    Auth.userType([2, 3]),
    Validator.checkString("qSetName"),
    Validator.checkString("qSetDesc"),
    Validator.checkString("subjectCode"),
    Validator.validate()
]
    , function (req, res) {//create 
        QuestionSet.createNew(req.body.qSetName, req.body.qSetDesc, req.body.subjectCode).then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            return res.status(500).send(err)
        })
    })

router.patch("/", [
    Auth.userType([2, 3]),
    Validator.checkNumber("qSetId", { min: 0 }),
    Validator.checkString("qSetName"),
    Validator.checkString("qSetDesc"),
    Validator.validate()
], function (req, res) {
    QuestionSet.updateDetail(req.body.qSetId, req.body.qSetName, req.body.qSetDesc).then(function (result) {
        return res.status(200).send()
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})

router.delete("/", [
    Auth.userType([2, 3])
], function (req, res) {
    var id = req.query.id;
    if (!id || id < 0) {
        return res.status(400).send("invalid id");
    }
    QuestionSet.deleteSet(id).then(function (result) {
        return res.status(200).send()
    }).catch(function (err) {
        return res.status(500).send(err);
    })

})

router.post("/question", [
    Auth.userType([2, 3]),
    Validator.checkNumber("qSetId", { min: 0 }),
    Validator.checkNumber("questionId", { min: 0 }),
    Validator.validate()
]
    , function (req, res) {
        QuestionSet.addQuestion(req.body.qSetId, req.body.questionId).then(function (result) {
            return res.status(200).send()
        }).catch(function (err) {
            return res.status(500).send(err)
        })
    })

router.delete("/question", [
    Auth.userType([2, 3]),
    Validator.checkNumber("qSetId", { min: 0 }),
    Validator.checkNumber("questionId", { min: 0 }),
    Validator.validate()
], function (req, res) {
    QuestionSet.removeQuestion(req.body.qSetId, req.body.questionId).then(function (result) {
        return res.status(200).send()
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})

router.post("/staff", [
    Auth.userType([2, 3]),
    Validator.checkString("staffId", { min: 12, max: 12 }),
    Validator.checkNumber("qSetId", { min: 0 }),
    Validator.validate()
], function (req, res) {
    if (req.body.staffId == "000000000000") {
        req.body.staffId = req.user.id
    }
    QuestionSet.addStaff(req.body.qSetId, req.body.staffId).then(function (result) {
        return res.status(200).send()
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})

router.delete("/staff", [
    Auth.userType([2, 3]),
    Validator.checkString("staffId", { min: 12, max: 12 }),
    Validator.checkNumber("qSetId", { min: 0 }),
    Validator.validate()
], function (req, res) {
    QuestionSet.unlinkStaff(req.body.qSetId, req.body.staffId).then(function (result) {
        return res.status(200).send()
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})

router.get("/",
    Auth.userType([2, 3])
    , function (req, res) {
        var accId = req.user.id
        var subjCode = null;
        if (req.query.subjCode) {
            subjCode = req.query.subjCode
        }
        QuestionSet.fetchQuestionSet(accId, subjCode).then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            return res.status(500).send(err)
        })

    })
module.exports = router;