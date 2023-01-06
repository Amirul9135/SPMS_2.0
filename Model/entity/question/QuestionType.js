const db = require("../../DBConn")
module.exports = class QuestionType {
    #intQTypeId;
    #strlabel;
    constructor(jObj = null) {
        this.#intQTypeId = -1;
        this.#strlabel = "";
        if (jObj != null) {
            if (jObj.hasOwnProperty("intQTypeId")) {
                this.#intQTypeId = jObj["intQTypeId"];
            }
            if (jObj.hasOwnProperty("strlabel")) {
                this.#strlabel = jObj["strlabel"];
            }
        }
    }
    setIntQTypeId(intQTypeId) {
        this.#intQTypeId = intQTypeId
    }
    getIntQTypeId() {
        return this.#intQTypeId;
    }

    setStrlabel(strlabel) {
        this.#strlabel = strlabel
    }
    getStrlabel() {
        return this.#strlabel;
    }

    static getAll() {
        return new Promise(function (resolve, reject) {
            db.query("SELECT * FROM question_type", function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(JSON.parse(JSON.stringify(result)))
                }
            })
        });
    }
}