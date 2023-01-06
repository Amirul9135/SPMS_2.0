
const jwt = require("jsonwebtoken")
const config = require("config")

module.exports = function (ws, req) {
    ws.on('message', message => {
        if (isJson(message)) {
            message = JSON.parse(message);
            console.log(message);
        }
        else {
            console.log(message);
        }
    });
}
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
} 