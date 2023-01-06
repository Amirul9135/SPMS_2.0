
//var questionTypes = []  
var UpdateMode = false;
var cacheQuestion = null;
function loadData() {
    console.log("loading")
    const urlParams = new URLSearchParams(window.location.search);
    console.log(window.location.search)
    console.log(urlParams)
    if (!urlParams.get('id')) {
        return
    }
    var id = urlParams.get('id');
    Server.request("GET", "/api/question/?id=" + id, null, true).then(function (value) {
        value = JSON.parse(value)
        UpdateMode = true;
        document.getElementById("btnSave").style.display = "none";
        document.querySelectorAll(".qUpdateMode").forEach(upElement => {
            upElement.style.display = "inline-block"
        })
        cacheQuestion = value;
        setupUpdateMode(value)
    }).catch(function (value) {
        Swal.fire({
            type: 'error',
            title: 'Error',
            text: 'question not found',
        })
        navigate('/questionBank');
    })

}

function setupUpdateMode(questionJson) {
    document.querySelectorAll(".rad-qtype").forEach(rad => {
        if (rad.value == "qtype" + questionJson.intQuestionType) {
            rad.checked = true;
        }
        rad.disabled = true;
    })
    Server.request("GET", "/api/topic/?id=" + questionJson.intTopicId, null, false).then(function (value) {
        value = JSON.parse(value)
        var subjectSS = document.getElementById("SSsubject");
        subjectSS.disabled = true;
        var subjectSSList = document.getElementById(subjectSS.dataset.list);
        subjectSSList.querySelectorAll("li").forEach(item => {
            if (item.id == value.strSubjectCode) {
                subjectSSList.dataset.selected = item.id;
                subjectSS.value = item.innerHTML.trim();
            }
        })
        document.getElementById("selectTopic").innerHTML = '<option value="' + value.intTopicId + '" selected>' + value.strTopicTitle + '</option>'
    }).catch(function (err) {
        Message.createNew("error", "failed to retrieve topic information", 3);
        //return navigate('/questionBank');
    })

    document.getElementById("txtaQuestionText").value = questionJson.strQuestionText;
    if (questionJson.intQuestionType == 2) {
        noAns = true;
    }
    else {
        document.getElementById("dvQuestionAnswer").style.display = "flex";
    }
    if (questionJson.intQuestionType == 1) {
        noAnsAttachment = true;
    }

    Server.request("GET", "/api/question/attachmentList?id=" + questionJson.intQuestionId, null, false).then(function (result) {
        result = JSON.parse(result);
        result.forEach(attc => {
            var img = createElementFromHTML('<img  class="image-fluid attachment-upload" data-toggle="modal" data-target="#ModalZoom" onclick="zoomImage(event)">')
            img.src = "/res/images/attachment/" + attc.attachmentId + ".png";
            img.title = attc.label;
            img.id = attc.attachmentId;
            var dv = createElementFromHTML('<div class="col-md-3 btn text-center attachment-holder"></div')
            var inp = createElementFromHTML('<input id="" type="text" title="label to be displayed during assessment" placeholder="label to be displayed during assessment" class="form-control attachment-label">')
            inp.value = attc.label;
            dv.appendChild(inp)
            dv.appendChild(createElementFromHTML('<a class="btn btn-red btn-botImage ans-att-remove"  style="border-radius:50%"'
                + 'onclick="removeAttachment(event)" id="rmv' + attc.attachmentId + '"  ><i class="fa fa-remove text-white "></i></a>'))
            dv.appendChild(img)
            document.getElementById("QuestionImageRow").appendChild(dv)

        })
    }).catch(function (err) {
    })


    Server.request("GET", "/api/question/answer/?id=" + questionJson.intQuestionId, null, false).then(function (value) {
        value = JSON.parse(value)
        var tgt = document.getElementById("ansInnerContainer");
        value.forEach(ans => {
            generateAnswer(tgt, ans.answerNo, ans.attachmentId);
        })
        document.querySelectorAll(".answer-card").forEach(ansC => {
            var ansNo = parseInt(ansC.id.replace("ansNo", ""))
            var index = findIndexofJSAR(value, "answerNo", ansNo);

            ansC.querySelectorAll("input").forEach(inp => {
                if (inp.id == "ansText") {
                    inp.value = value[index].answerText;
                }
                else if (inp.id == "ansRM") {
                    inp.value = value[index].relativeMark;
                }
            })
            if (value[index].attachmentId != null) {
                var rowAnsContent = ansC.querySelectorAll(".ansContentRow")[0];
                var img = createElementFromHTML('<img  class="image-fluid attachment-upload" data-toggle="modal" data-target="#ModalZoom" onclick="zoomImage(event)">')
                img.src = "/res/images/attachment/" + value[index].attachmentId + ".png";
                img.id = value[index].attachmentId;
                var dv = createElementFromHTML('<div class="col-md-3 btn text-center attachment-holder new-attachment"></div>')
                dv.appendChild(createElementFromHTML('<a class="btn btn-red btn-botImage ans-att-remove"  style="border-radius:50%"'
                    + 'onclick="removeAttachment(event)" id="rmv' + value[index].attachmentId + '"  ><i class="fa fa-remove text-white "></i></a>'))
                dv.appendChild(img)
                rowAnsContent.appendChild(dv);
                ansC.querySelectorAll(".dv-ans-attach")[0].style.display = "none";
            }

        })

        console.log(value)
    }).catch(function (value) {
        console.log(value)
    })
}

async function remove_ans_card(e) {//from card header option
    var action = await Swal.fire({
        type: 'question',
        title: 'Confirm Action',
        text: 'Permanently Remove Answer?',
        showCancelButton: true
    })
    if (action.dismiss) {
        return;
    }

    var ansNo = e.target.parentElement.parentElement.parentElement.id;
    if (ansNo == "ansNo-1") {
        e.target.parentElement.parentElement.parentElement.remove();
        return;
    }
    var minAns = 0;
    if (cacheQuestion.intQuestionType == 0) {
        minAns = 2;
    }
    if (cacheQuestion.intQuestionType == 1) {
        minAns = 1;
    }
    if (document.querySelectorAll(".answer-card").length <= minAns) {
        Message.createNew("Warning", "Question must have at least " + minAns + " answer", 2);
        return;
    }
    var ansNo = e.target.parentElement.parentElement.parentElement.id;
    if (ansNo != "ansNo-1") {//not default
        ansNo = parseInt(ansNo.replace("ansNo", ""))
        Server.request("DELETE", "/api/question/answer?questionId=" + cacheQuestion.intQuestionId + "&answerNo=" + ansNo, null, false).then(
            function (value) {

                e.target.parentElement.parentElement.parentElement.remove();
                Message.createNew("Success", "answer deleted", 0);
            }
        ).catch(function (value) {
            Message.createNew("Error", value, 3);
        })
    }

}

async function updateQuestionText() {
    var cur = document.getElementById("txtaQuestionText").value;
    if (cur.length < 5) {
        Message.createNew("Warning", "Question text too short", 2);
        return;
    }
    if (cur == cacheQuestion.strQuestionText) {
        Message.createNew("Warning", "No change", 2);
        return;
    }
    var action = await Swal.fire({
        type: 'question',
        title: 'Confirm Action',
        text: 'Update question text?',
        showCancelButton: true
    })
    if (action.dismiss) {
        return;
    }

    Server.request("PATCH", "/api/question/?id=" + cacheQuestion.intQuestionId, { "strQuestionText": cur }, false).then(
        function (value) {
            Message.createNew("Updated", "Question Text Updated", 0)
        }
    ).catch(function (value) {
        Message.createNew("Error", value, 3)
    })

}

var noAns = false;
var noAnsAttachment = false;
function changeSubject(e) {
    var subjId = document.getElementById(e.target.dataset.list).dataset.selected;
    if (e.target.value != -1) {
        Server.request("POST", "/api/question/getTopicBySubject", { subjectId: subjId }, false).then(
            function (value) {
                value = JSON.parse(value)
                var fragment = document.createDocumentFragment();
                fragment.appendChild(createElementFromHTML('<option value="-1">Select Topic</option>'))
                value.forEach(topic => {
                    fragment.appendChild(createElementFromHTML('<option value="' + topic.topicId + '">' + topic.title + '</option>'))
                });
                document.getElementById("selectTopic").innerHTML = "";
                document.getElementById("selectTopic").appendChild(fragment);
                document.getElementById("selectTopic").removeAttribute("disabled");
            }
        ).catch(function (value) {

        })
    }
    else {
        document.getElementById("selectTopic").setAttribute("disabled", "");
    }
}
function saveAttachmentChange() {
    if (!UpdateMode)
        return;
    linkQuestionAttachment(cacheQuestion.intQuestionId).then(function (value) {
        Message.createNew("success", "attachment changes saved", 0)
    })
}

function linkQuestionAttachment(questionId = -1) {
    return new Promise(function (resolve, reject) {
        var attachLinkObj = {};
        attachLinkObj["intQuestionId"] = questionId;
        var tmpAtt = {};
        document.getElementById("QuestionImageRow").querySelectorAll(".attachment-holder").forEach(att => {
            tmpAtt[att.children[2].id] = att.children[0].value;
            att.classList.remove("new-attachment");
        })
        attachLinkObj["attachments"] = tmpAtt;
        if (Object.keys(tmpAtt).length == 0) {
            return reject("no change");

        }
        Server.request("POST", "/api/question/addQuestionAttachment", attachLinkObj, false).then(function (value) {
            resolve(value);
        }).catch(function (value) {
            reject(value);
        })
    })
}

function updateAnswer() {
    if (cacheQuestion.intQuestionType != 2) { //2 t/f x perlu check answer
        //answerchecking
        var err = false;
        document.querySelectorAll(".in-answerText").forEach(ansText => {
            if (ansText.value.length == 0) {
                Message.createNew("Warning", "Answer Text cannot be empty", 2)
                err = true;
                return;
            }
        })

        if (err) {
            return;
        }

        var totalMark = 0;
        document.querySelectorAll(".in-answerMark").forEach(ansMark => {
            if (ansMark.value != "") {
                var mark = parseFloat(ansMark.value)
                if (mark > 100) {
                    Message.createNew("Warning", "A single answer may only have maximum of 100% mark", 2);
                    return;
                }
                totalMark += mark;

            }
        })
        if (totalMark < 100) {
            Message.createNew("Warning", "Total mark of all question must be at least 100%", 2);
            return;
        }
    }
    submitAnswer(cacheQuestion.intQuestionId);
}

function submitAnswer(questionId = -1) {
    return new Promise(function (resolve, reject) {
        var answerArr = []
        document.querySelectorAll(".answer-card").forEach(ansCard => {
            var answer = {}
            answer["intQuestionId"] = questionId;
            if (ansCard.id != "ansNo-1") {
                answer["intAnswerNo"] = parseInt(ansCard.id.replace("ansNo", ""))
            }
            ansCard.querySelectorAll("input").forEach(inp => {
                if (inp.id == "ansText") {
                    answer["strAnswerText"] = inp.value;
                }
                else if (inp.id == "ansRM") {
                    if (inp.value != "")
                        answer["dblRelativeMark"] = parseInt(inp.value);
                    else
                        answer["dblRelativeMark"] = 0;
                }
            })
            var ansAtt = ansCard.querySelectorAll(".attachment-upload");
            if (ansAtt.length != 0) {
                answer["intAttachmentId"] = parseInt(ansAtt[0].id);
            }
            answerArr.push(answer)
        })
        if (UpdateMode) {
            Server.request("PATCH", "/api/question/answer", answerArr, false).then(function (value) {
                Message.createNew("Saved", "Answer information saved", 0)
                navigate('/questionCreate?id=' + cacheQuestion.intQuestionId)
                resolve(value);
            }).catch(function (value) {
                reject(value);
            })
        }
        else {
            Server.request("POST", "/api/question/answer", answerArr, false).then(function (value) {
                resolve(value);
            }).catch(function (value) {
                reject(value);
            })
        }
    })
}
async function removeQuestion() {
    if (cacheQuestion != null) {
        var action = await Swal.fire({
            type: 'question',
            title: 'Confirm Action',
            text: 'Permanently Remove Question?',
            showCancelButton: true
        })
        if (action.dismiss) {
            return;
        }
        Server.request("DELETE", "/api/question/?id=" + cacheQuestion.intQuestionId, null, false).then(
            function (value) {
                Message.createNew("Deleted", "Question deleted successfully", 0);

                navigate('/questionBank');

            }
        ).catch(function (value) {
            Message.createNew("Error", value, 3)
        })
    }
}

function submitQuestion() {
    //var creatorId = "222222222222" //temporary server side read from jwt
    var topicId = parseInt(document.getElementById("selectTopic").value);
    var questionType = -1;

    document.querySelectorAll(".rad-qtype").forEach(rad => {
        if (rad.checked)
            questionType = parseInt(rad.value.replace("qtype", ""));
    })
    if (questionType == -1) {
        Message.createNew("Warning", "Please select a question type", 2)
        return;
    }
    var QuestionText = document.getElementById("txtaQuestionText").value;
    if (QuestionText.length < 5) {
        Message.createNew("Warning", "Question text too short", 2);
        return;
    }
    if (topicId < 0) {
        Message.createNew("Warning", "Please Select a topic", 2);
        return;
    }
    var ansCount = document.querySelectorAll(".answer-card").length;
    if (!noAns && ansCount == 0) {
        Message.createNew("Warning", "Please insert answer for the question", 2);
        return;
    }
    if (questionType == 0 && ansCount < 2) {
        Message.createNew("Warning", "Multiple choice question must at least have 2 answer option", 2)
        return;
    }
    if (questionType != 2) { //2 t/f x perlu check answer
        //answerchecking

        var err = false;
        document.querySelectorAll(".in-answerText").forEach(ansText => {
            if (ansText.value.length == 0) {
                Message.createNew("Warning", "Answer Text cannot be empty", 2)
                err = true;
                return;
            }
        })

        if (err) {
            return;
        }

        var totalMark = 0;
        document.querySelectorAll(".in-answerMark").forEach(ansMark => {
            if (ansMark.value != "") {
                var mark = parseFloat(ansMark.value)
                if (mark > 100) {
                    Message.createNew("Warning", "A single answer may only have maximum of 100% mark", 2);
                    return;
                }
                totalMark += mark;

            }
        })
        if (totalMark < 100) {
            Message.createNew("Warning", "Total mark of all question must be at least 100%", 2);
            return;
        }
    }
    var questionObj = {};
    questionObj["intTopicId"] = parseInt(topicId);
    questionObj["intQuestionType"] = parseInt(questionType);
    questionObj["strQuestionText"] = QuestionText;
    Server.request("POST", "/api/question/", questionObj, true).then(async function (value) {
        value = JSON.parse(value)
        //uploadAttachment(value.success)
        if (!noAns) {
            await submitAnswer(value.success);
        }
        if (document.getElementById("QuestionImageRow").querySelectorAll(".attachment-holder").length > 0) {
            await linkQuestionAttachment(value.success);
        }

        Message.createNew("Success", "Question Created with Id:" + value.success, 0);
        navigate('/findQuestion');

    }).catch(function (value) {
        value = JSON.parse(value)
        if (value.hasOwnProperty("validationError")) {
            displayValidationError(value);
        }
        else {
            Message.createNew("Error", value, 3);
        }
    })
}

function ansTypeChange(e) {
    if (e.target.value == "qtype1") {
        noAnsAttachment = true;
    }
    else {
        noAnsAttachment = false;
    }

    document.getElementById("ansInnerContainer").innerHTML = "";
    document.getElementById("dvQuestionAnswer").style.display = "flex";
    if (e.target.value == "qtype2") {
        //t or false
        noAns = true;
        document.querySelectorAll(".card-answer-container").forEach(cont => {
            cont.style.display = "none"
        })
    }
    else {
        noAns = false;
        document.querySelectorAll(".card-answer-container").forEach(cont => {
            cont.style.display = "initial"
        })
    }
}
var selectedLanguage = {};

function createAnswer(event) {
    generateAnswer(event.target.parentElement.parentElement.getElementsByClassName("answerContainer")[0], -1)
}


function generateAnswer(target, answNo = -1) {

    var html = '<div class="card answer-card" id="ansNo' + answNo
        + '"><div class="card-header"><h3 class="card-title">Answer</h3>'
        + '<div class="card-options"><i class="fe fe-chevron-up" onclick="toggle_card(event)"></i>&nbsp;&nbsp;<i class="fe fe-x" onclick="remove_ans_card(event)"></i></div>'
        + '</div><div class="card-body"><div class="row ansContentRow"><div class="col-md-8"><div class="form-group"><label class="form-label">answer text</label><input type="text" id="ansText" '
        + 'class="form-control in-answerText" placeholder="Text.."></div><div class="form-group"><label class="form-label">relative mark (%)</label><input type="number" min="0" max="100" value="0" id="ansRM" '
        + 'class="form-control in-answerMark"></div></div>';
    if (!noAnsAttachment) {
        html += '<div class="col-md-3 dv-ans-attach"><img  src="/res/images/pholder.png'
        html += '" onclick="answerAttachment(event)" data-toggle="modal" data-target="#ModalAttachment"></div>'
    }
    html += '</div></div></div>'

    target.appendChild(createElementFromHTML(html));
}

//var fileCache = {}

function prevUpload(event) {
    document.getElementById("prevTest").src = URL.createObjectURL(event.target.files[0])
}

var imageUploadTarget = null;
function answerAttachment(event) {
    imageUploadTarget = event.target;
}

function generatePreview() {
    var file = document.getElementById("uploadQAttach").files[0];
    if (!file) {
        return;
    }
    if (document.getElementById(file.name) != undefined) {
        Message.createNew("Duplicate file", "File with same already choosen", 2);
        return;
    }
    var imgName = document.getElementById("uploadQAttachDBName").value
    if (imgName.length < 6) {
        Message.createNew("Invalid image name", "image name should at least be 6 character", 2);
        return;
    }
    uploadAttachment(file, imgName).then(function (value) {
        value = value[0];
        var img = createElementFromHTML('<img  class="image-fluid attachment-upload" data-toggle="modal" data-target="#ModalZoom" onclick="zoomImage(event)">')
        img.src = "/res/images/attachment/" + value.id + ".png";
        img.title = value.fname;
        img.id = value.id;
        var dv = createElementFromHTML('<div class="col-md-3 btn text-center attachment-holder new-attachment"></div>')

        if (imageUploadTarget == null)
            dv.appendChild(createElementFromHTML('<input id="' + file.name + '" type="text" title="label to be displayed during assessment" placeholder="label to be displayed during assessment" class="form-control attachment-label">'))

        dv.appendChild(createElementFromHTML('<a class="btn btn-red btn-botImage ans-att-remove"  style="border-radius:50%"'
            + 'onclick="removeAttachment(event)" id="rmv' + value.id + '"  ><i class="fa fa-remove text-white "></i></a>'))
        dv.appendChild(img)
        if (imageUploadTarget != null) {
            var targetparent = imageUploadTarget.parentElement.parentElement;

            imageUploadTarget.parentElement.style.display = "none"
            targetparent.innerHtml = ""
            targetparent.appendChild(dv);
            imageUploadTarget = null;
        }
        else {
            document.getElementById("QuestionImageRow").appendChild(dv)
            if (UpdateMode) {
                linkQuestionAttachment(cacheQuestion.intQuestionId)
            }
        }


        $('#ModalAttachment').modal('hide');
        document.getElementById("prevTest").src = "";
        document.getElementById("uploadQAttachDBName").value = "";
        document.getElementById("uploadQAttach").value = "";
    }).catch(function (value) {
        Message.createNew("Error", value, 3);
    })
}

function removeAttachment(event) {
    Swal.fire({
        type: 'warning',
        title: 'Warning',
        text: 'are you sure you want to delete this attachment?',
        showCancelButton: true
    }).then(function (action) {
        if (action.value) {
            if (event.target.classList.contains("ans-att-remove")) {
                event.target.parentElement.parentElement.children[1].style.display = "initial";
            }
            removeAttachmentFromServer(event.target.id.replace("rmv", ""), event.target.parentElement)
        }
    })
}


function removeAttachmentFromServer(fId, element) {
    //later add unlink here , nk delete go to manage attachment
    Server.request("GET", "/api/question/attachment/delete?intAttachmentId=" + fId, null, false).then(function (value) {
        element.remove();
    }).catch(function (value) {
        Message.createNew("Error", value, 3);
    })
}

function uploadAttachment(file, name) {
    return new Promise(async function (resolve, reject) {
        var fdata = new FormData();
        fdata.append(name, file)

        const response = await fetch("/api/question/attachment/upload", {
            method: 'POST',
            body: fdata
        })

        response.json().then(data => {
            if (response.status == 200) {
                resolve(data)
            }
            else {
                reject(data)
            }
        })
    })

}
