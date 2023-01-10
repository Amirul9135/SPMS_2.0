const express = require('express');
const router = express.Router();
const School = require('../Model/entity/School');
const Staff = require("../Model/entity/Staff");
//const SchoolStudent = require('../Model/entity/SchoolStudent');
//const fnStrLength = require("./Middleware/stringLength"); 
//const Validator = require("./Middleware/Validator");

router.post('/register', function (req, res) {
    var newSchool = new School();
    newSchool.setStrFullName(req.body.fullName);
    newSchool.setStrAbbrv(req.body.abbrv);
    newSchool.setStrDescription(req.body.description);

    var promiseRegister = newSchool.registerSchool();
    //calback function when resolve and reject
    promiseRegister.then(function (value) { //.then means resolve (no error)
        res.send("Success");
    }).catch(function (value) { //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/update', function (req, res) {
    var updateSchool = new School();
    updateSchool.setIntSchoolId(req.body.schoolId);
    updateSchool.setStrFullName(req.body.fullName);
    updateSchool.setStrAbbrv(req.body.abbrv);
    updateSchool.setStrDescription(req.body.description);

    var update = updateSchool.updateSchool();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});

router.post('/delete', function (req, res) {
    var delSchool = new School();
    delSchool.setIntSchoolId(req.body.schoolId);

    var del = delSchool.deleteSchool();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});

router.get('/getSchool', function (req, res) {
    var schoolId = "0"
    var promiseAll = School.getSchool(schoolId);
    promiseAll.then(function (value) {
        console.log(value);
        return res.send(value);
    }).catch(function (value) {
        console.log(value);
        return res.status(400).send(value);
    });
});

router.get('/allSchool', function (req, res) {
    var promiseAll = School.getAll();
    promiseAll.then(function (value) {
        console.log(value);
        res.send(JSON.stringify(value));
    }).catch(function (value) {
        console.log(value);
        res.status(400).send(value);
    });
});

module.exports = router;