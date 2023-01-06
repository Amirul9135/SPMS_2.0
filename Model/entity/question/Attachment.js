const db = require("../../DBConn")

module.exports = class Attachment {
    #intAttachmentId;
    #strName;
    #strCreatorId;
    constructor(jObj = null) {
        this.#intAttachmentId = -1;
        this.#strName = "";
        this.#strCreatorId = "";
        if (jObj != null) {
            if (jObj.hasOwnProperty("intAttachmentId")) {
                this.#intAttachmentId = jObj["intAttachmentId"];
            }
            if (jObj.hasOwnProperty("strName")) {
                this.#strName = jObj["strName"];
            }
            if (jObj.hasOwnProperty("strCreatorId")) {
                this.#strCreatorId = jObj["strCreatorId"];
            }
        }
    }
    setIntAttachmentId(intAttachmentId) {
        this.#intAttachmentId = intAttachmentId
    }
    getIntAttachmentId() {
        return this.#intAttachmentId;
    }

    setStrName(strName) {
        this.#strName = strName
    }
    getStrName() {
        return this.#strName;
    }

    setStrCreatorId(strCreatorId) {
        this.#strCreatorId = strCreatorId
    }
    getStrCreatorId() {
        return this.#strCreatorId;
    }


    insertIntoDb() {
        var strSql = "INSERT INTO attachment (name) VALUES(" + db.escape(this.#strName) + ")"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(result.insertId);
                }
            })
        })
    }
    static loadFromDb(id) {
        var strSql = "SELECT * FROM attachment WHERE attachmentId=" + db.escape(id)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    result = JSON.parse(JSON.stringify(result));
                    if (result.length == 1) {
                        result = result[0]
                        resolve(new Attachment({
                            "intAttachmentId": result.attachmentId,
                            "strName": result.name,
                            "strCreatorId": result.creatorId
                        }))
                    }
                    else {
                        reject("not found")
                    }
                }
            })
        })
    }


    deleteThis() {
        var strSql = "DELETE FROM attachment WHERE attachmentId=" + db.escape(this.#intAttachmentId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err.message)
                }
                else {
                    resolve(result.affectedRows)
                }
            })
        })
    }
}