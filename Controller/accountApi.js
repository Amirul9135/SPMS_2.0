const express = require('express');
const router = express.Router();
const Account = require("../Model/entity/Account");
const Student = require("../Model/entity/Student");
const Staff = require("../Model/entity/Staff");
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
        Auth.userType([2, 3]),
        Validator.checkString("accountId", { min: 12, max: 12 }),
        Validator.checkString("name", "nama is required"),
        Validator.checkString("email", "email required"),
        Validator.checkString("password", { min: 6 }),
        Validator.checkString("phone", { min: 10, max: 11 }),
        Validator.checkNumber("userType", { min: 1, max: 3 }),
        Validator.validate()
    ]
    , async function controller(req, res) {
        console.log('sini')
        if (!isValidIc(req.body.accountId)) {
            return res.status(400).send({ validationError: { ID: "invalid ID" } })
        }
        if (!isValidEmail(req.body.email)) {
            return res.status(400).send({ validationError: { email: "invalid format" } })
        }
        if (!isValidPhone(req.body.phone)) {
            return res.status(400).send({ validationError: { phone: "invalid format" } })
        }
        if (req.body.userType == 2 && !req.body.schoolId) {
            return res.status(400).send({ validationError: { school: "invalid school Id" } })
        }
        var newAcc = new Account();
        newAcc.setStrAccountId(req.body.accountId);
        newAcc.setStrName(req.body.name);
        const salt = await bcrypt.genSalt(10);
        var hashed = await bcrypt.hash(req.body.password, salt)
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
                newStaff.setIntschoolId(req.body.schoolId)
                // console.log(newStaff.getStrStaffId())
                newStaff.register().then(function (value) {
                    return res.send("success");
                }).catch(function (value) {//.catch means promis is rejected, got some error
                    return res.status(400).send(value);
                });
            }
        }).catch(function (value) {//.catch means promis is rejected, got some error
            if (value.includes('ER_DUP_ENTRY')) {

                return res.status(400).send({ validationError: { accountId: "Already exist" } })
            }
            return res.status(400).send(value);
        });
    })


router.post('/update',
    [
        Auth.userType(),
        Validator.checkString("name", "nama is required"),
        Validator.checkString("email", "required"),
        Validator.checkString("phone", { min: 10, max: 11 }),
        Validator.validate()
    ]
    , function (req, res) {

        if (!isValidEmail(req.body.email)) {
            return res.status(400).send({ validationError: { email: "invalid format" } })
        }
        if (!isValidPhone(req.body.phone)) {
            return res.status(400).send({ validationError: { phone: "invalid format" } })
        }
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


router.post('/delete', [

    Auth.userType([2, 3]),
    Validator.checkString("accountId"),
    Validator.validate()
],
    function (req, res) {
        var delAcc = new Account();
        console.log(req.body.accountId)
        delAcc.setStrAccountId(req.body.accountId);
        var del = delAcc.delete();
        del.then(function (value) {//berjaya 
            return res.status(200).send();
        }).catch(function (value) {//no change atau error 
            console.log(value)
            return res.status(400).send(value);
        });
    });

router.post('/activate', [
    Auth.userType([2, 3])
], function (req, res) {
    if (!req.query.accountId) {
        return res.status(400).send()
    }
    var nacc = new Account()
    nacc.setStrAccountId(req.query.accountId)
    nacc.reActivate().then(function (result) {
        return res.status(200).send()
    }).catch(function (err) {
        console.log(err)
        return res.status(500).send({ error: err })
    })
})

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

router.get('/allStudent', Auth.userType([2, 3]), function (req, res) {
    var schoolId = req.query.schoolId;
    if (!schoolId) {
        return res.status(400).send("invalid id");
    }
    let year = null
    if (req.query.year) {
        year = req.query.year
    }
    if (req.query.classId) {
        if (req.query.classId == "null") {
            req.query.classId = null
        }
    }

    var promiseAll = Student.getStudent(schoolId, req.query.classId, year);
    promiseAll.then(function (value) {
        res.send(value);
    }).catch(function (value) {
        console.log(value);
        res.status(400).send(value);
    });
});


router.get('/allStaff', Auth.userType([3]), function (req, res) {
    var schoolId = req.query.schoolId;
    if (!schoolId) {
        return res.status(400).send("invalid id");
    }
    var promiseAll = Staff.getStaffList(schoolId);
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
        (req, res, next) => { console.log('masuk'); console.log(req); next() },
        Validator.checkString("accountId", { min: 6 }, "name must be at least 6 character"),
        Validator.checkString("password", { min: 6 }, "password must be at least 6 character"),
        Validator.validate()
    ]
    , function (req, res) {
        console.log('login attempt')
        console.log(req.body)
        var newAcc = new Account({
            "straccountId": req.body["accountId"]
        });
        newAcc.login().then(async function (result) {
            console.log('login')
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
                var payload = {
                    user: {
                        id: accId,
                        name: result.name,
                        type: result.userType
                    }
                }
                if (result.userType == 2) {
                    console.log('error here')
                    payload.user.schoolId = result.schoolId
                    payload.user.schoolName = result.abbrv
                }
                console.log(payload)
                jwt.sign(payload,
                    global.jwts[accId],
                    (err, token) => {
                        if (err) throw err
                        var fragment = token.toString().split('.');
                        var mid = Math.floor(fragment[2].length / 2);
                        console.log(fragment[2].substr(0, mid))
                        console.log(fragment[2].substr(mid))
                        console.log(fragment[1])
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
            console.log(err)
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

router.post('/password', [
    Auth.userType(),
    Validator.checkString("password", { min: 6 }),
    Validator.checkString("newPassword", { min: 6 })
], function (req, res) {
    if (req.user.id == 3) {
        if (req.body.accountId) {
            //kalau ada accountId dlm body mesti nk ubahkan password account lain
        }
    }
    //normal tukar pass sendiri
    var acc = new Account({
        "straccountId": req.user.id
    });
    acc.login().then(async function (result) {
        var ismatch = await bcrypt.compare(req.body.password, result.password)
        if (!ismatch) {
            return res.status(401).send('invalid current password')
        }
        else {
            const salt = await bcrypt.genSalt(10);
            var hashed = await bcrypt.hash(req.body.newPassword, salt)
            acc.saveNewPassword(hashed).then(function (result) {
                return res.status(200).send()
            }).catch(function (err) {
                return res.status(500).send({ error: err })
            })

        }
    })
})

router.get('/verify',
    Auth.userType(),
    function (req, res) {
        console.log('verify');
        console.log(req.user)
        return res.status(200).send(req.user)
    })

router.post('/staff/school', [
    Auth.userType([2, 3]),
    Validator.checkString('staffId', { min: 12, max: 12 }),
    Validator.checkNumber('schoolId', { min: 0 }),
    Validator.validate()
], function (req, res) {
    var nstaff = new Staff()
    nstaff.setStrStaffId(req.body.staffId)
    nstaff.setIntschoolId(req.body.schoolId)
    nstaff.updateSchool().then(function (result) {
        return res.status(200).send()
    }).catch(function (err) {
        console.log(err)
        return res.status(500).send({ error: err })
    })
})


function isValidEmail(strEmail) {
    return /^.+@.+\.\w+$/.test(strEmail)
}
function isValidIc(strIc) {
    return /^\d{12}$/.test(strIc)
}
function isValidPhone(strPhone) {
    return /^\d{10,11}$/.test(strPhone)
}

module.exports = router; //bila nk require something dari file lain file tu mesti ada module.exports