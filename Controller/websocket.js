
const jwt = require("jsonwebtoken")
const config = require("config")
global.students = {}
global.staff = {}

module.exports = function (ws, req) {
    ws.on('message', message => {
        if (isJson(message)) {
            message = JSON.parse(message);
            if (message.hasOwnProperty("verify")) {
                console.log('vrf')
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
                    ws.user = decoded.user;
                    ws.assessment = message.verify.assessment
                    if (decoded.user.type == 1) {
                        ws.studentstats = 1
                        if (!global.students.hasOwnProperty(message.verify.assessment.toString())) {
                            global.students[message.verify.assessment.toString()] = []
                        }
                        ws.on('close', function (p) {
                            if (ws.studentstats != 3) {
                                ws.studentstats = 0
                            }
                            if (global.students[ws.assessment.toString()]) {

                                global.students[ws.assessment.toString()] = global.students[ws.assessment.toString()].filter(socket => { socket.user.id != ws.user.id })
                                if (global.students[ws.assessment.toString()].length == 0) {
                                    delete global.students[ws.assessment.toString()]
                                }
                            }
                            broadcastMe(ws)
                            console.log(ws.studentstats)
                            console.log('close')
                        })
                        global.students[message.verify.assessment.toString()].push(ws)
                        broadcastMe(ws)
                        console.log('connected')
                    }
                    else if (decoded.user.type == 2 || decoded.user.type == 3) {
                        console.log('stf')

                        if (!global.staff.hasOwnProperty(message.verify.assessment.toString())) {
                            global.staff[message.verify.assessment.toString()] = []
                        }
                        ws.on('close', function (p) {
                            if (global.staff[ws.assessment.toString()]) {

                                global.staff[ws.assessment.toString()] = global.staff[ws.assessment.toString()].filter(socket => { socket.user.id != ws.user.id })
                                if (global.staff[ws.assessment.toString()].length == 0) {
                                    delete global.staff[ws.assessment.toString()]
                                }
                            }
                        })
                        global.staff[message.verify.assessment.toString()].push(ws)
                        fetchAllStudentStatus(ws)

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
                console.log(message.status)
                ws.studentstats = message.status
                if (message.status == 3) {//finish

                    ws.close()
                }
                else {
                    broadcastMe(ws)
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

function broadcastMe(ws) {
    let strasid = ws.assessment.toString()
    if (!global.staff.hasOwnProperty(strasid)) {
        return
    }
    global.staff[strasid].forEach(s => {
        s.send(JSON.stringify([{ id: ws.user.id, status: ws.studentstats }]))
    });

}

function fetchAllStudentStatus(ws) {//staff
    let strasid = ws.assessment.toString()
    if (!global.students.hasOwnProperty(strasid)) {
        return
    }
    ws.send(JSON.stringify(currentStudentStatus(ws.assessment)))

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