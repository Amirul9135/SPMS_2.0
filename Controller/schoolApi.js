const express = require('express'); 
const router = express.Router(); 
const School = require('../Model/entity/School');
const SchoolTeacher = require('../Model/entity/SchoolTeacher');
const Staff = require("../Model/entity/Staff");
//const SchoolStudent = require('../Model/entity/SchoolStudent');
//const fnStrLength = require("./Middleware/stringLength"); 
//const Validator = require("./Middleware/Validator");

router.post('/register', function (req, res) {     
    var newSch = new School();
    newSch.setIntSchoolId(req.body.schoolId);
    newSch.setStrFullNameSch(req.body.fullNamesch);
    newSch.setStrAbbrvSch(req.body.abbrvsch);
    newSch.setStrDescriptionSch(req.body.descriptionsch);
    newSch.register().then(function(value){ //.then means resolve (no error)
        res.send("Success");
    }).catch(function(value){ //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
    
});


router.post('/update', function (req, res) { 
    var updateSch = new School();
    updateSch.setIntSchoolId(req.body.schoolId);
    updateSch.setStrFullNameSch(req.body.fullNamesch);
    updateSch.setStrAbbrvSch(req.body.abbrvsch);
    updateSch.setStrDescriptionSch(req.body.descriptionsch);
    var update = updateSch.update();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});
router.post('/delete', function (req, res) {
    var delSch = new School();
    delSch.setIntSchoolId(req.body.schoolId);
    var del = delAcc.delete();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});

router.get('/getSchool', function (req, res) {
    var schoolId ="0"
    var promiseAll = School.getSchool(schoolId);
    promiseAll.then(function (value) {
        console.log(value);
        return res.send(value);
    }).catch(function (value) {
        console.log(value);
        return res.status(400).send(value);
    });
});



 
module.exports = router;