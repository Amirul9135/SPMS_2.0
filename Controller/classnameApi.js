const express = require('express'); 
const router = express.Router(); 
const className = require ('../Model/entity/ClassName');



router.post('/register', function (req, res) {     
    var newclsname = new className();
    newclsname.setIntCNId(req.body.CNId);
    newclsname.setStrFullNameClass(req.body.fullNameClass);
    newclsname.setStrAbbrvClass(req.body.abbrvclass);
    newclsname.register().then(function(value){ //.then means resolve (no error)
        res.send("Success");
    }).catch(function(value){ //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});
router.post('/update', function (req, res) { 
    var updateclsname = new className();
    updateclsname.setIntCNId(req.body.CNId);
    updateclsname.setStrFullNameClass(req.body.fullNameClass);
    updateclsname.setStrAbbrvClass(req.body.abbrvclass);

    var update = updateclsname.update();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});
router.post('/delete', function (req, res) {
    var delclsname = new className();
    delclsname.setIntCNId(req.body.CNId);
    var del = delclsname.delete();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});


module.exports = router;