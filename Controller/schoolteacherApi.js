const express = require('express'); 
const router = express.Router(); 
//const School = require('../Model/entity/School');
const SchoolTeacher = require('../Model/entity/SchoolTeacher');
//const SchoolStudent = require('../Model/entity/SchoolStudent');
//const fnStrLength = require("./Middleware/stringLength"); 
//const Validator = require("./Middleware/Validator");

router.post('/register', function (req, res) {     
    var newschteacher = new SchoolTeacher();

    newschteacher.setIntSchoolId(req.body.schoolId);
    newschteacher.setStrTeacherId(req.body.teacherId);
    newschteacher.setStrStartDate(req.body.startDate);
    newschteacher.setStrEndDate(req.body.endDate);
    newschteacher.register().then(function(value){ //.then means resolve (no error)
        res.send("Success");
    }).catch(function(value){ //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/update', function (req, res) { 
    var updateST = new SchoolTeacher();
    updateST.setIntSchoolId(req.body.schoolId);
    updateST.setStrTeacherId(req.body.teacherId);
    updateST.setStrStartDate(req.body.startDate);
    updateST.setStrEndDate(req.body.endDate);
    var update = updateST.update();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});
router.post('/delete', function (req, res) {
    var delST = new SchoolTeacher();
    delST.setIntCNId(req.body.CNId);
    var del = delST.delete();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});


 
module.exports = router;