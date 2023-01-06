const path = require("path")

module.exports = class fileUploadValidator {
    static checkExtension(allowedExt) {
        return function (req, res, next) {
            var files = req.files;
            const fileExtensions = []
            Object.keys(files).forEach(key => {
                fileExtensions.push(path.extname(files[key].name).toLowerCase())
            })

            const allowed = fileExtensions.every(ext => allowedExt.includes(ext))
            if (!allowed)
                return res.status(400).send({ error: "invalid file extension" })
            next();
        }
    }
    static maxMbSize(mbLimit) {
        return function (req, res, next) {
            var maxSize = mbLimit * 1024 * 1024;
            var files = req.files;
            Object.keys(files).forEach(key => {
                if (files[key].size > maxSize) {
                    return res.status(400).send({ error: "file size limit exceeded for file " + files[key].name })
                }
            })
            next()
        }
    }
    static fileExist() {
        return function (req, res, next) {

            if (!req.files)
                return res.status(400).send({ error: "no file" })
            next();
        }
    }
}