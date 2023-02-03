const config = require("config");
const jwt = require("jsonwebtoken");

class Authenticate {

    constructor() { }
    userType(userTypeArr = null) {//user type integer in form of array 
        //validate previous checks from the req object and return response 
        return function (req, res, next) {
            console.log(req.header)
            if (!req.header('cookie')) {
                return res.status(401).send("not logged in");
            }
            console.log(req.header('cookie').includes('token='));
            if (req.header('cookie').includes('token=') && req.header('jwtT') && req.header('jwtP')) {
                var fullToken = config.get("jwtHead") + "." + req.header('jwtP') + "." + req.header('cookie').replace('token=', '')
                    + req.header('jwtT');
                if (!global.jwts) {// kalau xde jwts xde sape2 penah login
                    return res.status(401).send("not logged in");
                }
                if (!global.jwts.hasOwnProperty(req.header('uid'))) {//kalau xde secret untuk id die user ni x penah login
                    return res.status(401).send("not logged in");
                }
                try {
                    const decoded = jwt.verify(fullToken, global.jwts[req.header('uid')]);
                    req.user = decoded.user;
                    if (userTypeArr != null && userTypeArr != undefined) {
                        if (userTypeArr.includes(decoded.user.type)) {
                            return next();
                        }
                        else {
                            return res.status(401).send("unauthorized access");
                        }
                    }
                    return next();
                }
                catch (err) {
                    console.log(err)
                    return res.status(401).json({ msg: "Invalid Token" });
                }
            }
            else {
                console.log("si")
                return res.status(401).send("Invalid Token");

            }

        }
    }
}
module.exports = new Authenticate;