

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

document.querySelectorAll('.btn-normal').forEach(b => {
    b.addEventListener("contextmenu", (e) => {
        if (e.target.classList.contains('bg-warning')) {
            e.target.classList.remove('bg-warning')
        }
        else {
            e.target.classList.add('bg-warning')
        }
        e.preventDefault()
    })
})

var assessmentId;
var submitTimeouts = {}
var answerCache = {}
var mainTimeout
var tPrev = 0;
var tElapsed = 0;
var clock;
var clock_time;
var totalTime;
var timeLeft;

window.onblur = function () {
    ws.send(JSON.stringify({ status: 2 }))

    document.body.classList.add('overlayHide')
    console.log("focusout")
    //  tElapsed = timePoint() - tPrev
}
document.addEventListener('copy', function (e) {
    e.preventDefault();
})
window.onkeydown = function (e) {
    console.log(e)
    if (e.key == "Meta") {
        document.body.classList.add('overlayHide')
        window.blur()
    } if (e.keyCode == 44) {
        console.log('apekah')
        $("body").hide();
    }
}
window.onkeyup = function (e) {
    if (e.code == "PrintScreen") {
        navigator.clipboard.writeText('')
    }
}
window.onfocus = function () {
    ws.send(JSON.stringify({ status: 1 }))

    document.body.classList.remove('overlayHide')
    // tPrev = timePoint()
}

function setup() {

    clock = document.getElementById('dv_clock')
    clock_time = document.getElementById('clock_time')


    var ndate = new Date(document.getElementById("dtEndAttempt").dataset.real)
    console.log(ndate)
    totalTime = ndate.getTime() - new Date().getTime()
    timeLeft = totalTime
    mainTimeout = setTimeout(endAssessment, totalTime)

    //timeout end assessment
    $('#ModalAssessmentDetail').modal('show');
    goToQuestion(1);
    assessmentId = parseInt(document.getElementById('ModalAssessmentDetail').dataset.asid)
    resetTimer()
    updateClock()
    WS()
}

var percentTime
function updateClock() {
    console.log('upd')
    timeLeft = timeLeft - 1000 //1sec
    clock_time.innerHTML = timeString(timeLeft)
    percentTime = Math.floor(timeLeft / totalTime * 100) //second count
    clock.style.background = "conic-gradient(green 0.00% " + percentTime + "%, #c9c9c9 " + percentTime + "% 100%)"

    setTimeout(() => {
        updateClock()
    }, 1000);
}
var ws;
function WS() {
    ws = new WebSocket('ws:/' + window.location.hostname + ':5000/');
    if (localStorage.getItem("jwtT") != null && localStorage.getItem("uid") != null && localStorage.getItem("jwtP") != null) {
        ws.onopen = () => {
            ws.send(JSON.stringify({
                "verify": {
                    "uId": localStorage.getItem("uid"),
                    "jwtP": localStorage.getItem("jwtP"),
                    "jwtT": localStorage.getItem("jwtT"),
                    "assessment": assessmentId
                }
            }))
        };
        ws.onmessage = function (message) {
            var jsonData = JSON.parse(message.data)
        }
    }
}

function resetTimer() {
    tPrev = timePoint()
    tElapsed = 0
}

async function endAssessment() {
    ws.send(JSON.stringify({ status: 3 }))
    await Swal.fire({
        type: 'warning',
        title: 'Attempt Time Ended'
    })
    navigate('/')
}

function btnQuestion(e) {
    console.log(e.target.id)
    var num
    if (e.target.id) {

        num = parseInt(e.target.id.replace('btn', ''))
    }
    else {
        num = e.target.dataset.next;
    }
    goToQuestion(num)
}

function goToQuestion(num) {
    document.querySelectorAll('.my-tab-show').forEach(tb => {
        tb.classList.remove('my-tab-show')
        tb.classList.add('my-tab-hide')
    })
    document.querySelectorAll('.btn-active').forEach(btn => {
        btn.classList.remove('btn-active')
    })
    document.getElementById('btn' + num).classList.add('btn-active')
    document.getElementById('Q' + num).classList.add('my-tab-show')
    document.getElementById('Q' + num).classList.remove('my-tab-hide')
}


function submitHandler(e) {
    var card = e.target.closest(".question_card")
    var question = card.dataset;
    var val = e.target.value.trim()
    if (submitTimeouts.hasOwnProperty(question.qid)) {
        clearTimeout(submitTimeouts[question.qid])
    }
    submitTimeouts[question.qid] = setTimeout(function () {
        if (answerCache[question.qid] == val) {
            return//no change return no need to submit, reduce trafic
        }
        answerCache[question.qid] = val
        submitAnswer(val, question.qid, question.qtype, card.id)
    }, 1000)
    //timeut 1000 ms, 1 second, minor delay to reduce trafic in case user change too much in short amount of time
}


function submitAnswer(ans, qid, type, cardId) {
    console.log(cardId)
    var data = {
        "assessmentId": assessmentId,
        "questionId": parseInt(qid),
        "questionType": parseInt(type)
    }
    if (type == 0) {
        data["ansNo"] = parseInt(ans)
    }
    else if (type == 1) {
        data["ansText"] = ans
    }
    data["time"] = timePoint() - tPrev + tElapsed
    if (data["time"] >= 1) {
        data["time"] = data["time"] - 1//1000ms , 1 second delay of the request
    }
    resetTimer()
    Server.request("POST", "/api/assessment/submit", data, true).then(function (result) {
        document.getElementById("btn" + cardId.replace('Q', '')).classList.add('btn-answered')
        console.log('submitted')
    }).catch(function (err) {
        console.log(err)
    })
}

function timePoint() {
    return Math.floor(new Date().getTime() / 1000)
}

async function finishAttempt() {

    var unAns = ""
    document.querySelectorAll('.btn-normal').forEach(btn => {
        if (!btn.classList.contains('btn-answered')) {
            unAns += " (" + btn.id.replace('btn', '') + ")"
        }
    })
    if (unAns != "") {

        var conf = await Swal.fire({
            type: "warning",
            title: "You may have left some question",
            html: "Check question <br>" + unAns,
            showCancelButton: true,
            confirmButtonText: "proceed anyway"
        })
        if (conf.dismiss) {
            return;
        }
    }
    var action = await Swal.fire({
        type: "warning",
        title: "Submit And Finish Attempt?",
        html: "You will no longer be able to continue attempt or edit your answer<br>Are you sure?",
        showCancelButton: true
    })
    if (action.value) {
        if (action.value == true) {
            Server.request('POST', '/api/assessment/finishAttempt', { "assessmentId": assessmentId }, true).then(function (result) {
                ws.send(JSON.stringify({ status: 3 }))
                clearTimeout(mainTimeout)
                navigate('/')
            }).catch(function (err) {
                console.log(err)
            })
        }
    }
}

function dragElStart(e) {
    console.log(e.target)
    dragElement(e.target)
}
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;
    /*
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }*/

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
} 