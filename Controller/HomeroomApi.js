const express = require('express'); 
const router = express.Router(); 
const HomeroomTeacher = require ('../Model/entity/HomeroomTeacher');



router.post('/register', function (req, res) {     
    var newHT = new HomeroomTeacher();
    newHT.setIntClassId(req.body.classlId);
    newHT.setStrTeacherId(req.body.teacherId);
    newHT.setStrStartDateHT(req.body.startDateHT);
    newHT.setStrEndDateHT(req.body.endDateHT);
    newHT.register().then(function(value){ //.then means resolve (no error)
        res.send("Success");
    }).catch(function(value){ //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/update', function (req, res) { 
    var updateHT = new HomeroomTeacher();
    updateHT.setIntClassId(req.body.classlId);
    updateHT.setStrTeacherId(req.body.teacherId);
    updateHT.setStrStartDateHT(req.body.startDateHT);
    updateHT.setStrEndDateHT(req.body.endDateHT);

    var update = updateHT.update();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});
router.post('/delete', function (req, res) {
    var delHT = new HomeroomTeacher();
    delHT.setIntCNId(req.body.CNId);
    var del = delHT.delete();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});


module.exports = router;