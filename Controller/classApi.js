const express = require('express'); 
const router = express.Router(); 
const Class = require ('../Model/entity/Class');


router.post('/register', function (req, res) {     
    var newcls = new Class();
    newcls.setIntClassId(req.body.classId);
    newcls.setIntSchoolId(req.body.schoolId);
    newcls.setIntClassName(req.body.className);
   
    newcls.register().then(function(value){ //.then means resolve (no error)
        res.send("Success");
    }).catch(function(value){ //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});
router.post('/update', function (req, res) { 
    var updatecls = new Class();
    updatecls.setIntClassId(req.body.classId);
    updatecls.setIntSchoolId(req.body.schoolId);
    updatecls.setIntClassName(req.body.className);

    var update = updatecls.update();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});
router.post('/delete', function (req, res) {
    var delcls = new Class();
    delcls.setIntClassId(req.body.classId);
    var del = delcls.delete();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});
router.get('/getClass', function (req, res) {
    var classlId ="2"
    var promiseAll = Class.getClass(classlId);
    promiseAll.then(function (value) {
        console.log(value);
        return res.send(value);
    }).catch(function (value) {
        console.log(value);
        return res.status(400).send(value);
    });
});

router.get('/getstudentclass', function (req, res) {
    var classId="2"
    var promiseAll = Class.getstudentclass(classId);
    promiseAll.then(function (value) {
        console.log(value);
        return res.send(value);
    }).catch(function (value) {
        console.log(value);
        return res.status(400).send(value);
    });
});

module.exports = router;