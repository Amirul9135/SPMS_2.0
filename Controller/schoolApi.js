const express = require('express');
const Class = require('../Model/entity/Class');
const router = express.Router();
const School = require('../Model/entity/School');
const Staff = require("../Model/entity/Staff");
const Validator = require('./Middleware/Validator');
const Auth = require("./Middleware/Authenticate")
//const SchoolStudent = require('../Model/entity/SchoolStudent');
//const fnStrLength = require("./Middleware/stringLength"); 
//const Validator = require("./Middleware/Validator");

router.post('/register', [
    Auth.userType([3]),
    Validator.checkString('fullName'),
    Validator.checkString('description'),
    Validator.checkString("abbrv"),
    Validator.checkNumber("county", { min: 0 }),
    Validator.validate()
], function (req, res) {
    var newSchool = new School();
    newSchool.setStrFullName(req.body.fullName);
    newSchool.setStrAbbrv(req.body.abbrv);
    newSchool.setStrDescription(req.body.description);
    newSchool.setIntCounty(req.body.county)

    var promiseRegister = newSchool.registerSchool();
    //calback function when resolve and reject
    promiseRegister.then(function (value) { //.then means resolve (no error)
        res.send("Success");
    }).catch(function (value) { //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/update', [
    Auth.userType([3]),
    Validator.checkString('fullName'),
    Validator.checkString('description'),
    Validator.checkString("abbrv"),
    Validator.validate()
], function (req, res) {
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

router.post('/delete', Auth.userType([3]), function (req, res) {
    if (!req.body.schoolId) {
        return res.status(400).send()
    }
    var delSchool = new School();
    delSchool.setIntSchoolId(req.body.schoolId);

    var del = delSchool.deleteSchool();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});

router.get('/getSchool', Auth.userType([2, 3]), function (req, res) {
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

router.get('/allSchool', Auth.userType([2, 3]), function (req, res) {
    var promiseAll = School.getAll();
    promiseAll.then(function (value) {
        console.log(value);
        res.send(JSON.stringify(value));
    }).catch(function (value) {
        console.log(value);
        res.status(400).send(value);
    });
});


router.get('/classList', Auth.userType([2, 3]), function (req, res) {
    if (!req.query.schId) {
        return res.status(400).send()
    }
    Class.getAllClassInSchool(req.query.schId).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})

router.get('/county', Auth.userType([2, 3]), function (req, res) {
    if (!req.query.id) {
        return res.status(400).send()
    }
    School.schoolByCounty(req.query.id).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})

module.exports = router;