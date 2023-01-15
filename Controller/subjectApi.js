const express = require('express');
const router = express.Router();
const Subject = require("../Model/entity/Subject");
const Auth = require("./Middleware/Authenticate")

router.post('/register', Auth.userType([3]), function (req, res) {
    var newSubject = new Subject();
    newSubject.setSubjectCode(req.body.subjectCode);
    newSubject.setSubjectTitle(req.body.subjectTitle);

    var promiseRegister = newSubject.register();
    //calback function when resolve and reject
    promiseRegister.then(function (value) { //.then means resolve (no error)
        res.send("Success");
    }).catch(function (value) { //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/update', Auth.userType([3]), function (req, res) {
    var updateSubject = new Subject();
    updateSubject.setSubjectTitle(req.body.subjectTitle);
    updateSubject.setSubjectCode(req.body.subjectCode);

    var update = updateSubject.update();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});

router.get('/', Auth.userType(), function (req, res) {
    var subjectCode = req.query.subjectCode;
    var promiseAll = Subject.getSubject(subjectCode);

    promiseAll.then(function (value) {
        console.log(value);
        return res.send(value);
    }).catch(function (value) {
        console.log(value);
        return res.status(400).send(value);
    });
});

router.post('/delete', Auth.userType([3]), function (req, res) {
    var delSubj = new Subject();
    delSubj.setSubjectCode(req.body.subjectCode);
    var del = delSubj.deleteThis();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});

router.get('/allSubject', Auth.userType(), function (req, res) {
    var promiseAll = Subject.getAll();
    promiseAll.then(function (value) {
        console.log(value);
        res.send(JSON.stringify(value));
    }).catch(function (value) {
        console.log(value);
        res.status(400).send(value);
    });
});

module.exports = router;