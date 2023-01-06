const db = require("../DBConn")
module.exports= class Guardian{
    #strguardianId;
    #strregisterDate;

    constructor() {
        this.#strguardianId = "";
        this.#strregisterDate = "";
    }
    setStrGuardianId(strguardianId) {
        this.#strguardianId = strguardianId;
    }
    getStrGuardianId() {
        return this.#strguardianId;
    }
    setStrRegisterDate(strregisterDate) {
        this.#strregisterDate = strregisterDate;
    }
    getStrRegisterDate() {
        return this.#strregisterDate;
    }

    register() {
       
     var strsql = "INSERT INTO guardian(guardianId,registerDate) VALUES ('"+ this.#strguardianId +"', '"+ this.#strregisterDate +"')"; 
        return new Promise(function(resolve, reject){ 
             console.log(strsql);
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
}