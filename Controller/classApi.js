const express = require('express'); 
const router = express.Router(); 
const Class = require ('../Model/entity/Class');


router.post('/register', function (req, res) {     
    var newcls = new Class();
    // newcls.setIntClassId(req.body.classId);
    newcls.setIntSchoolId(req.body.schoolId);
    newcls.setIntClassName(req.body.className);
    newcls.setStrAccountId(req.body.accountId);
   
    newcls.register().then(function(value){ //.then means resolve (no error)
        res.send("Success");
    }).catch(function(value){ //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/update', function (req, res) { 
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

router.get('/getClassBySchool', function (req, res) {
    var schoolId = req.query.schoolId;;
    var promiseAll = Class.getClassBySchool(schoolId);
    promiseAll.then(function (value) {
        console.log(value);
        return res.send(value);
    }).catch(function (value) {
        console.log(value);
        return res.status(400).send(value);
    });
});

// router.post("/getClassBySchool", function (req, res) {
//     var schoolId = req.query.schoolId;
//     if (!schoolId) {
//         return res.status(400).send("invalid school id");
//     }
//     Address.getPostCode(schoolId).then(function (result) {
//         return res.status(200).send(result)
//     }).catch(function (err) {
//         return res.status(500).send(err)
//     })
// })

// router.get('/getClass', function (req, res) {
//     var classId ="5"
//     var promiseAll = Class.getClass(classId);
//     promiseAll.then(function (value) {
//         console.log(value);
//         return res.send(value);
//     }).catch(function (value) {
//         console.log(value);
//         return res.status(400).send(value);
//     });
// });

router.post('/getClassBySchool', function (req, res) {
    Class.getClassBySchool(req.body.schoolId).then(
        function (value) {
            return res.status(200).send(value);
        }
    ).catch(function (value) {
        return res.status(500).send(value);
    })
})

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

router.get('/getTeacher', function (req, res) {
    var promiseAll = Class.getTeacher();
    promiseAll.then(function (value) {
        console.log(value);
        res.send(JSON.stringify(value));
    }).catch(function (value) {
        console.log(value);
        res.status(400).send(value);
    });
});

module.exports = router;