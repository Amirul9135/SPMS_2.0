const express = require('express');
const router = express.Router();
const Account = require("../Model/entity/Account");
const Student = require("../Model/entity/Student");
const Staff = require("../Model/entity/Staff");

const Guardian = require("../Model/entity/Guardian");
//const fnStrLength = require("./Middleware/stringLength"); 
const Validator = require("./Middleware/Validator");
const Utils = require("./Utils")
const jwt = require("jsonwebtoken");
const ServerCache = require("../server_cache")
const jwtsCache = new ServerCache('data/jwts')
const crypto = require("crypto")
const Auth = require("./Middleware/Authenticate")
const bcrypt = require("bcryptjs")

router.post('/register',

    [
        Validator.checkString("accountId", { min: 12, max: 12 }),
        Validator.checkString("name", "nama is required"),
        Validator.checkString("email", "email required"),
        Validator.checkString("password", { min: 6 }),
        Validator.checkString("phone", { min: 10, max: 11 }),
        Validator.validate()
    ]
    , async function controller(req, res) {
        var newAcc = new Account();
        newAcc.setStrAccountId(req.body.accountId);
        newAcc.setStrName(req.body.name);
        const salt = await bcrypt.genSalt(10);
        var hashed = await bcrypt.hash(req.body.password, salt)
        console.log(hashed)
        newAcc.setStrPassword(hashed);
        newAcc.setStrEmail(req.body.email);
        //  newAcc.setIntEmailVerified(req.body.emailVerified);
        newAcc.setStrPhone(req.body.phone);
        newAcc.setIntUserType(req.body.userType);
        newAcc.setStrDateRegistered(Utils.getDateNow());
        newAcc.setStrImage(req.body.image);
        newAcc.register().then(function (value) { //.then means resolved, no error
            console.log(req.body)
            if (req.body.userType == 1) {
                var newStud = new Student();
                //console.log(req.body.accountId);//dalam request die account id
                newStud.setStrStudentId(req.body.accountId);
                //console.log(newStud.getStrStudentId())
                newStud.register().then(function (value) {
                    return res.send("success");
                }).catch(function (value) {//.catch means promis is rejected, got some error
                    return res.status(400).send(value);
                });
            }
            else if (req.body.userType == 2) {
                var newStaff = new Staff();
                //console.log(req.body.accountId);//dalam request die account id
                newStaff.setStrStaffId(req.body.accountId);
                // console.log(newStaff.getStrStaffId())
                newStaff.register().then(function (value) {
                    return res.send("success");
                }).catch(function (value) {//.catch means promis is rejected, got some error
                    return res.status(400).send(value);
                });
            }
        }).catch(function (value) {//.catch means promis is rejected, got some error
            return res.status(400).send(value);
        });
    })


router.post('/update',
    [
        Auth.userType(),
        Validator.checkString("name", "nama is required"),
        Validator.checkString("email", "@required"),
        Validator.checkString("phone", { min: 10, max: 11 }),
        Validator.validate()
    ]
    , function (req, res) {
        var updateAcc = new Account();
        var accountId = req.user.id
        updateAcc.setStrAccountId(accountId);
        updateAcc.setStrName(req.body.name);
        updateAcc.setStrEmail(req.body.email);
        updateAcc.setStrPhone(req.body.phone);
        var update = updateAcc.update();
        update.then(function (value) {//berjaya
            res.status(200).send();
        }).catch(function (value) {//no change atau error
            res.status(400).send(value);
        });
    });


router.post('/delete',
    Validator.checkString("accountId"),
    Validator.validate(),
    function (req, res) {
        var delAcc = new Account();
        delAcc.setStrAccountId(req.body.accountId);
        var del = delAcc.delete();
        del.then(function (value) {//berjaya 
            res.status(200).send();
        }).catch(function (value) {//no change atau error 
            res.status(400).send(value);
        });
    });

router.get('/',
    Auth.userType()
    , function (req, res) {

        var accountId = req.user.id;
        var promiseAll = Account.getAccount(accountId);
        promiseAll.then(function (value) {
            return res.send(value);
        }).catch(function (value) {
            console.log(value);
            return res.status(400).send(value);
        });
    });

router.get('/allStudent', function (req, res) {
    var schoolId = req.query.schoolId;
    if (!schoolId) {
        return res.status(400).send("invalid id");
    }
    var promiseAll = Student.getStudent(schoolId, req.query.classId);
    promiseAll.then(function (value) {
        console.log(value);
        res.send(value);
    }).catch(function (value) {
        console.log(value);
        res.status(400).send(value);
    });
});


router.get('/allStaff', function (req, res) {
    var schoolId = req.query.schoolId;
    if (!schoolId) {
        return res.status(400).send("invalid id");
    }
    var promiseAll = Staff.getStaff(schoolId);
    promiseAll.then(function (value) {
        console.log(value);
        res.send(JSON.stringify(value));
    }).catch(function (value) {
        console.log(value);
        res.status(400).send(value);
    });
});


router.post('/login',
    [
        Validator.checkString("accountId", { min: 6 }, "name must be at least 6 character"),
        Validator.checkString("password", { min: 6 }, "password must be at least 6 character"),
        Validator.validate()
    ]
    , function (req, res) {
        var newAcc = new Account({
            "straccountId": req.body["accountId"]
        });
        newAcc.login().then(async function (result) {
            var accId = req.body["accountId"];
            var ismatch = await bcrypt.compare(req.body.password, result.password)
            if (ismatch) {//later use bcrypt compare
                if (!global.jwts)//if no jwts yet initialize
                    global.jwts = {};
                var secret = crypto.randomBytes(32).toString('hex');
                if (global.jwts && global.jwts.hasOwnProperty(accId)) {
                    while (secret == global.jwts[accId]) {
                        secret = crypto.randomBytes(32).toString('hex');
                    }
                }
                global.jwts[accId] = secret;
                jwtsCache.mcache.setItem(String(accId), secret)
                const payload = {
                    user: {
                        id: accId,
                        name: result.name,
                        type: result.userType
                    }
                }
                jwt.sign(payload,
                    global.jwts[accId],
                    (err, token) => {
                        if (err) throw err
                        var fragment = token.toString().split('.');
                        var mid = Math.floor(fragment[2].length / 2);
                        return res.cookie("token",
                            fragment[2].substr(0, mid),
                            {
                                httpOnly: true
                            })
                            .set({
                                jwtT: fragment[2].substr(mid),
                                jwtP: fragment[1]
                            }).send(payload);
                    }
                );
            }
            else {
                return res.status(401).send("invalid credentials");
            }
        }).catch(function (err) {
            return res.status(500).send(err)
        })

    })


router.get('/logout',
    Auth.userType(),
    function (req, res) {
        if (req.user) {
            if (global.jwts[req.user.id]) {
                jwtsCache.mcache.removeItem(String(req.user.id))
                delete global.jwts[req.user.id]
            }
        }
        console.log(req.user.id + " logged out")
        return res.cookie("token", "").status(200).send();
    })

router.get('/verify',
    Auth.userType(),
    function (req, res) {
        return res.status(200).send(req.user)
    })


module.exports = router; //bila nk require something dari file lain file tu mesti ada module.exports