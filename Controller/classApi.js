const express = require('express');
const router = express.Router();
const Class = require('../Model/entity/Class');
const ClassStudent = require('../Model/entity/ClassStudent');
const Auth = require('./Middleware/Authenticate')


router.post('/register', Auth.userType([2, 3]), function (req, res) {
    var newcls = new Class();
    // newcls.setIntClassId(req.body.classId);
    newcls.setIntSchoolId(req.body.schoolId);
    newcls.setIntClassName(req.body.className);
    newcls.setStrAccountId(req.body.accountId);

    newcls.register().then(function (value) { //.then means resolve (no error)
        res.send("Success");
    }).catch(function (value) { //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/update', Auth.userType([2, 3]), function (req, res) {
    var updatecls = new Class();
    updatecls.setIntClassId(req.body.classId);
    updatecls.setStrAccountId(req.body.accountId);
    updatecls.setIntClassName(req.body.className);

    var update = updatecls.update();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});

router.post('/delete', Auth.userType([2, 3]), function (req, res) {
    var delcls = new Class();
    delcls.setIntClassId(req.body.classId);

    var del = delcls.delete();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});

router.post('/getClassBySchool', Auth.userType([2, 3]), function (req, res) {
    console.log('get school')
    console.log(req.body)
    Class.getClassBySchool(req.body.schoolId).then(
        function (value) {
            return res.status(200).send(value);
        }
    ).catch(function (value) {
        return res.status(500).send(value);
    })
})

router.post('/getTeacher', Auth.userType([2, 3]), function (req, res) {
    Class.getTeacher(req.body.schoolId).then(
        function (value) {
            return res.status(200).send(value);
        }
    ).catch(function (value) {
        return res.status(500).send(value);
    })
});

router.post('/getClassStudent', Auth.userType([2, 3]), function (req, res) {
    ClassStudent.getClassStudent(req.body.classId).then(
        function (value) {
            return res.status(200).send(value);
        }
    ).catch(function (value) {
        return res.status(500).send(value);
    })
})

router.post('/getClassTeacher', Auth.userType([2, 3]), function (req, res) {
    ClassStudent.getClassTeacher(req.body.classId).then(
        function (value) {
            return res.status(200).send(value);
        }
    ).catch(function (value) {
        return res.status(500).send(value);
    })
})

router.post('/getStudent', Auth.userType([2, 3]), function (req, res) {
    ClassStudent.getStudent(req.body.schoolId).then(
        function (value) {
            return res.status(200).send(value);
        }
    ).catch(function (value) {
        return res.status(500).send(value);
    })
})

router.post('/registerStudent', Auth.userType([2, 3]), function (req, res) {
    var newStud = new ClassStudent();
    newStud.setIntClassId(req.body.classId);
    newStud.setStrStudentId(req.body.studentId);

    newStud.register().then(function (value) { //.then means resolve (no error)
        res.send("Success");
    }).catch(function (value) { //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/deleteStudent', Auth.userType([2, 3]), function (req, res) {
    var delStud = new ClassStudent();
    delStud.setIntClassId(req.body.classId);
    delStud.setStrStudentId(req.body.studentId);

    var del = delStud.deleteStudent();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});

router.post('/deleteStudentList', Auth.userType([2, 3]), function (req, res) {
    var delStud = new ClassStudent();
    delStud.setIntClassId(req.body.classId);

    var del = delStud.deleteStudentList();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});

module.exports = router;