const express = require('express'); 
const router = express.Router(); 
//const School = require('../Model/entity/School');
const SchoolStudent = require('../Model/entity/SchoolStudent');
//const SchoolStudent = require('../Model/entity/SchoolStudent');
//const fnStrLength = require("./Middleware/stringLength"); 
//const Validator = require("./Middleware/Validator");

router.post('/register', function (req, res) {     
    var newschschool = new SchoolStudent();

    newschschool.setIntSchoolId(req.body.schoolId);
    newschschool.setStrStudentId(req.body.studentId);
    newschschool.setStrEnrolDate(req.body.enrolDate);
    newschschool.setStrEndDateStudent(req.body.endDatestudent);
    newschschool.register().then(function(value){ //.then means resolve (no error)
        res.send("Success");
    }).catch(function(value){ //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/update', function (req, res) { 
    var updateSchStd = new SchoolStudent();
    updateSchStd.setIntSchoolId(req.body.schoolId);
    updateSchStd.setStrStudentId(req.body.studentId);
    updateSchStd.setStrEnrolDate(req.body.enrolDate);
    updateSchStd.setStrEndDateStudent(req.body.endDatestudent);
    var update = updateSchStd.update();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});
router.post('/delete', function (req, res) {
    var delSchStd = new SchoolStudent();
    delSchStd.setStrStudentId(req.body.studentId);
    var del = delST.delete();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});


 
module.exports = router;