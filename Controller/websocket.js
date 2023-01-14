
const jwt = require("jsonwebtoken")
const config = require("config")
global.students = {}
global.staff = {}

module.exports = function (ws, req) {
    ws.on('message', message => {
        if (isJson(message)) {
            message = JSON.parse(message);
            console.log(message)
            if (message.hasOwnProperty("verify")) {
                if (!req.headers.cookie) {
                    return;
                }
                var fullToken = config.get("jwtHead") + "." + message.verify.jwtP + "." + req.headers.cookie.replace('token=', '')
                    + message.verify.jwtT;
                if (!global.jwts) {// kalau xde jwts xde sape2 penah login
                    return;
                }
                if (!global.jwts.hasOwnProperty(message.verify.uId)) {//kalau xde secret untuk id die user ni x penah login
                    return;
                }
                try {
                    const decoded = jwt.verify(fullToken, global.jwts[message.verify.uId]);
                    console.log(decoded)
                    ws.user = decoded.user;
                    ws.assessment = message.verify.assessment
                    ws.studentstats = 1
                    if (decoded.user.type == 1) {
                        if (!global.students.hasOwnProperty(message.verify.assessment.toString())) {
                            global.students[message.verify.assessment.toString()] = []
                        }
                        ws.on('close', function (p) {
                            global.students[ws.assessment.toString()] = global.students[ws.assessment.toString()].filter(socket => { socket.user.id != ws.user.id })
                            if (global.students[ws.assessment.toString()].length == 0) {
                                delete global.students[ws.assessment.toString()]
                            }
                            broadCastStudentStatus(ws.assessment)
                            console.log('closed')
                            console.log(global.students)
                        })
                        global.students[message.verify.assessment.toString()].push(ws)
                        ws.send(JSON.stringify({
                            "status": 200,
                            "message": "kiosk connected"
                        }))
                    }
                    return;
                }
                catch (err) {
                    ws.send(JSON.stringify({
                        "status": 401,
                        "message": "verification fail"
                    }))
                }
            }
            else if (message.hasOwnProperty("status")) {
                ws.studentstats = message.status
                if (message.status == 3) {//finish
                    ws.close()
                }
                else {
                    broadCastStudentStatus(ws.assessment)
                }
            }
        }
        else {
            console.log(message);
        }
    });
}

function currentStudentStatus(assessmentId) {
    let id = assessmentId.toString()
    let studStats = []
    if (global.students.hasOwnProperty(id)) {
        global.students[id].forEach(std => {
            studStats.push({ id: std.user.id, status: std.studentstats })
        })
    }
    return studStats
}

function broadCastStudentStatus(assessmentId) {
    let id = assessmentId.toString()
    let studStats = currentStudentStatus(assessmentId)
    if (!global.staff.hasOwnProperty(id)) {
        return
    }
    //send to all staff 
    global.staff[id].forEach(s => {
        s.send(JSON.stringify(studStats))
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