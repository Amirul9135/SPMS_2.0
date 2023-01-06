const express = require("express");
const Address = require("../Model/address")
const Validator = require("./Middleware/Validator")
const router = express.Router();


router.get("/", function (req, res) {
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

module.exports = router;