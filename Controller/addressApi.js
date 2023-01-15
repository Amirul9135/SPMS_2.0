const express = require("express");
const Address = require("../Model/address");
const Auth = require("./Middleware/Authenticate");
const Validator = require("./Middleware/Validator")
const router = express.Router();


router.get("/", Auth.userType(), function (req, res) {
    var accountId = req.query.accountId;
    if (!accountId) {
        return res.status(400).send("Invalid accountId")
    }
    Address.getAddress(accountId).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send(err)
    })

})

router.post("/set",
    Auth.userType(),
    Validator.checkString("accountId", { min: 12, max: 12 }, "invalid account id"),
    Validator.checkString("addressText"),
    Validator.checkNumber("areaId", { min: 0 }),
    Validator.validate()
    , function (req, res) {
        Address.saveAddress(
            {
                "accountId": req.body.accountId,
                "addressText": req.body.addressText,
                "areaId": req.body.areaId
            }
        ).then(function (result) {
            return res.status(200).send(result)
        }).catch(function (err) {
            console.log('addr')
            console.log(err)
            return res.status(500).send(err)
        })
        //obj with accountId,addressText, areaId
    })



router.get("/postcode", function (req, res) {
    var stateCode = req.query.stateCode;
    if (!stateCode) {
        return res.status(400).send("invalid state code");
    }
    Address.getPostCode(stateCode).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send(err)
    })
})

router.get("/area", function (req, res) {
    var postcode = req.query.postcode;
    if (!postcode) {
        return res.status(400).send("Invalid postcode")
    }
    Address.getAreaInRegion(postcode).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send(err);
    })
})

router.get('/county', function (req, res) {
    if (!req.query.stateCode) {
        return res.status(400).send("invalid stateCode")
    }
    Address.getCountyInState(req.query.stateCode).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        console.log(err)
        return res.status(500).send({ error: err })
    })
})


router.get("/geo/area", Auth.userType([2, 3]), function (req, res) {
    if (!req.query.id) {
        return res.status(400).send()
    }
    Address.getAreaGeo(req.query.id).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})


router.post("/geo/area", [
    Auth.userType([2, 3]),
    Validator.checkNumber('areaId', { min: 0 }),
    Validator.validate()
], function (req, res) {
    console.log(req.body)
    if (!req.body.coord || !req.body.areaPolygon)
        return res.status(400).send({ validationError: { coord: 'must include coordinate and polygon' } })
    if (!validateCoord(req.body.coord))
        return res.status(400).send({ validationError: { point: 'invalid coordinate' } })
    for (var i = 0; i < req.body.areaPolygon[0].length; i++) {
        if (!validateCoord(req.body.areaPolygon[0][i]))
            return res.status(400).send({ validationError: { point: 'invalid coordinate' } })
    }
    //sampai sini dah valid da coord2 ni 
    //lastpoint
    var lp = req.body.areaPolygon[0][req.body.areaPolygon[0].length - 1]
    //first point
    var fp = req.body.areaPolygon[0][0]
    if ((lp[Object.keys(lp)[0]] != fp[Object.keys(fp)[0]]) || (lp[Object.keys(lp)[1]] != fp[Object.keys(fp)[1]])) {
        //if either lat long x y x equal diff point push ah sbb polygon kene start end at same point sql standard otherwise null
        //auto tutup function haha
        req.body.areaPolygon[0].push(fp)
    }
    console.log(JSON.stringify(req.body))
    Address.updateGeo(req.body).then(function (result) {
        return res.status(200).send(result)
    }).catch(function (err) {
        return res.status(500).send({ error: err })
    })
})


function validateCoord(coordObj) { //long lat x y as key 
    if (Object.keys(coordObj).length != 2) {
        return false
    }
    if (typeof (coordObj[Object.keys(coordObj)[0]]) != 'number' || typeof (coordObj[Object.keys(coordObj)[1]]) != 'number')
        return false
    if (coordObj[Object.keys(coordObj)[0]] > 180 || coordObj[Object.keys(coordObj)[0]] < -180) {
        //first key long/x max -180~180
        return false
    }
    if (coordObj[Object.keys(coordObj)[1]] > 90 || coordObj[Object.keys(coordObj)[1]] < -90) {
        return false
    }
    return true
}


module.exports = router;