
const db = require("../DBConn")
module.exports = class Account {
    #straccountId;
    #strname;
    #strpassword;
    #stremail;
    //  #intemailVerified;
    #strphone;
    #intuserType;
    #strdateRegistered;
    #strimage;

    constructor(jObj) {
        this.#straccountId = "";
        this.#strname = "";
        this.#strpassword = "";
        this.#stremail = "";
        //this.#intemailVerified = "";
        this.#strphone = "";
        this.#intuserType = "";
        this.#strdateRegistered = "";
        this.#strimage = "";
        if (jObj != null) {
            if (jObj.hasOwnProperty("straccountId")) {
                this.#straccountId = jObj["straccountId"];
            }
            if (jObj.hasOwnProperty("strpassword")) {
                this.#strpassword = jObj["strpassword"];
            }
        }
    }

    setStrAccountId(straccountId) {
        this.#straccountId = straccountId;
    }
    getStrAccountId() {
        return this.#straccountId;
    }
    setStrName(strname) {
        this.#strname = strname;
    }
    getStrName() {
        return this.#strname;
    }
    setStrPassword(strpassword) {
        this.#strpassword = strpassword;
    }
    getStrPassword() {
        return this.#strpassword;
    }
    setStrEmail(stremail) {
        this.#stremail = stremail;
    }
    getStrEmail() {
        return this.#stremail;
    }
    //setIntEmailVerified(intemailVerified) {
    // this.#intemailVerified = intemailVerified;//typo
    //  }
    // getIntEmailVerified() {
    //    return this.#intemailVerified;
    // }
    setStrPhone(strphone) {
        this.#strphone = strphone;
    }
    getStrPhone() {
        return this.#strphone;
    }
    setIntUserType(intuserType) {
        this.#intuserType = intuserType;
    }
    getIntUserType() {
        return this.#intuserType;
    }
    setStrDateRegistered(strdateRegistered) {
        this.#strdateRegistered = strdateRegistered;
    }
    getStrDatedRegistered() {
        return this.#strdateRegistered;
    }
    setStrImage(strimage) {
        this.#strimage = strimage;
    }
    getStrImage() {
        return this.#strimage;
    }

    register() {
        var strsql = "INSERT INTO account(accountId,name,password,email,phone,userType,dateRegistered) VALUES ("
            + db.escape(this.#straccountId) + ", " + db.escape(this.#strname) + ", " + db.escape(this.#strpassword) + ", " + db.escape(this.#stremail)
            + "," + db.escape(this.#strphone) + ", " + db.escape(this.#intuserType) + ", " + db.escape(this.#strdateRegistered) + ")";
        return new Promise(function (resolve, reject) {
            db.query(strsql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else {
                    resolve();
                }
            });
        });
    }

    update() {
        var strSql = "UPDATE account SET name = " + db.escape(this.#strname) + ", email = " + db.escape(this.#stremail) + ", phone = " + db.escape(this.#strphone) + " WHERE accountId=" + db.escape(this.#straccountId);
        console.log(strSql)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else if (result.affectedRows == 0) {
                    reject("no changes")
                }
                else {
                    resolve();
                }
            });
        });
    }

    delete() {
        var strSql = "UPDATE account SET disabled= CURRENT_DATE WHERE accountId=" + db.escape(this.#straccountId);
        // var strSql = "DELETE FROM account WHERE accountId=" + db.escape(this.#straccountId);
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else if (result.affectedRows == 0) {
                    reject("no changes")
                }
                else {
                    resolve("success");
                }
            });
        });
    }

    static getAccount(accountId) {
        return new Promise(function (resolve, reject) {
            var strSql = "SELECT accountId,name,email,phone,userType FROM account WHERE accountId=" + db.escape(accountId);
            db.query(strSql, function (err, result) {
                if (err) {
                    console.log("error:" + err.message);
                    reject(err.message);
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result))[0]);
                }
            });
        });
    }

    login() {
        var strSql = "SELECT a.name,a.password,a.userType,s.schoolId FROM account a LEFT JOIN staff s ON a.accountId = s.staffId WHERE accountId=" + db.escape(this.#straccountId) + "AND disabled IS NULL;"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 1) {
                        resolve(result[0])
                    }
                    else {
                        reject("user not found")
                    }
                }
            })
        })
    }

    saveNewPassword(encPass) {
        var strSql = "UPDATE account SET password=" + db.escape(encPass)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve()
                }
            })
        })
    }

    reActivate() {
        var strSql = "UPDAtE account SET disabled=NULL WHERE accountId=" + db.escape(this.#straccountId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve()
                }
            })
        })
    }
}