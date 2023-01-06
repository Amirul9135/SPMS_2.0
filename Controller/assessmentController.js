
const memcache = require('../memory_cache')
const Assessment = require("../Model/entity/assessment/Assessment")
const util = require("./Utils")
//cache question list in assessment
//reason: possibly heavy query, high number of execution on start of assessment
//memcache structure, key = assessment
//assessment: {
//      "assessmentId1": { question:[{questionId:??,mark:??},{questionId:??,mark:??}], 
//                         set: [ {questionSetId:?,count:?,mark:?,questions:[qid,qid...] }, {questionSetId:?,count:?,mark:?,questions:[qid,qid...] }]
//                       }
//      "assessmentId2": ....
//}
//
module.exports = class AssessmentController {
    assessmentId;
    studentId;
    asObj;
    constructor(asId, studId) {
        this.assessmentId = asId;
        this.studentId = studId;
    }


    async checkStatus() { // -1 closed/unavailable, 0 ongoing, 1 upcoming not started yet
        var assessment = new Assessment()
        assessment.assessmentId = this.assessmentId
        assessment = await assessment.load().catch(function (err) {
            console.log(err)
            return -1;
        })
        assessment = assessment[0]
        this.asObj = assessment
        var dopen = new Date(assessment.open)
        var dclose = new Date(assessment.close)
        var dNow = new Date()
        if (dNow.getTime() > dclose.getTime()) {
            return -1;//past
        }
        if (dNow.getTime() < dclose.getTime() && dNow.getTime() >= dopen.getTime()) {
            return 0;//ongoing
        }
        if (dNow.getTime() < dopen.getTime()) {
            return 1;//upcoming
        }
    }

    async checkIsParticipant() {
        var validStudent = 0;
        validStudent = await Assessment.validateStudent(this.assessmentId, this.studentId).catch(function (err) {
            console.log(err)
        })
        if (validStudent < 1) {
            return false
        }
        return true;
    }

    async checkAssignedQuestion() {
        var questionIds = []
        questionIds = await Assessment.checkAssignedQuestion(this.assessmentId, this.studentId).catch(function (err) {
            console.log(err)
        })
        return questionIds
    }

    async assignQuestion() {
        if (!memcache.has(this.assessmentId.toString())) {
            await this.loadAllQuestion(this.assessmentId)
        }
        var questionToAssign;
        var asQuestions = JSON.parse(memcache.get(this.assessmentId.toString()))
        questionToAssign = asQuestions.question;
        asQuestions.set.forEach(set => {
            if (set.count == set.questions.length) {//all
                set.questions.forEach(q => {
                    questionToAssign.push({ questionId: q, mark: set.mark })
                })
            }
            else if (set.count < set.questions.length) {// less get random 
                this.getRandom(set.questions.length, set.count).forEach(randomIndex => {
                    questionToAssign.push({ questionId: set.questions[randomIndex], mark: set.mark })
                })
            }
        })
        await Assessment.assignQuestion(this.assessmentId, this.studentId, questionToAssign).catch(function (err) {
            console.log(err)
        })
        return { success: true }//question id assigned
    }

    async startAttempt() {
        var enDuration = new Date()
        enDuration.setMinutes(enDuration.getMinutes() + this.asObj.duration)
        var enDate = new Date(this.asObj.close)
        if (enDuration.getTime() < enDate.getTime()) { //if max duration comes first use it, else use close as end attempt
            enDate = enDuration
        }

        console.log(enDate)
        enDate = util.localeToSqlDateTime(enDate.toLocaleString())
        console.log(enDate)
        await Assessment.startAttempt(this.assessmentId, this.studentId, util.getDateTimeNow(), enDate).catch(function (err) {
            return { error: err }
        })
    }

    async loadAllQuestion() {
        //no return just load
        var questionList = await Assessment.getAllQuestion(this.assessmentId)
        var questionSetList = await Assessment.getAllQuestionWithinSets(this.assessmentId)
        questionSetList.forEach(set => {//easier looping later
            set.questions = JSON.parse(JSON.stringify(set.questions.split(',').map(Number)))
        });
        //  questionSetList = JSON.parse(JSON.stringify(questionSetList))
        var asObj = {}
        asObj = { question: questionList, set: questionSetList }
        memcache.set(this.assessmentId.toString(), JSON.stringify(asObj), 600);
    }

    getRandom(len, limit) {
        if (len < limit) {
            return
        }
        var randomI = []
        if (len == limit) {
            var tmpI = 0;
            while (randomI.length != len) {
                randomI.push(tmpI)
                tmpI++;
            }
            return randomI
        }
        while (randomI.length != limit) {
            var tmpI = Math.floor(Math.random() * len)
            if (!randomI.includes(tmpI)) {
                randomI.push(tmpI)
            }
        }
        return randomI
    }
}