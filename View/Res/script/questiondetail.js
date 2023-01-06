
function viewQuestionDetail(qid) {
    Server.request("GET", "/api/question/detail?questionId=" + qid, null, true).then(
        function (result) {
            result = JSON.parse(result)
            document.getElementById("MDQ_Editbtn").dataset.questionid = qid
            document.getElementById("MQD_Subject").value = result.subject
            document.getElementById("MQD_Topic").value = result.topic
            document.getElementById("MQD_QuestionText").innerHTML = result.questionText
            document.getElementById("MQD_date").innerHTML = result.dateCreated.substring(0, 10)
            var useracc = localStorage.getItem('uid')
            if (useracc == result.creatorId) {
                document.getElementById("MDQ_Editbtn").style.display = "initial"
            }
            else {
                document.getElementById("MDQ_Editbtn").style.display = "none"
            }

            loadQuestionDetailAttachment(qid)
            if (result.questionType != 2) {
                //not t/f
                document.getElementById("MQD_AnsType").innerHTML = "Answers"
                document.getElementById("MQD_AnswerList").style.display = "initial"
                loadAnswer(qid)
            }
            else {
                document.getElementById("MQD_AnsType").innerHTML = "Answer Type: True or False"
                document.getElementById("MQD_AnswerList").style.display = "none"
            }
        }
    ).catch(function (err) {
        Message.createNew("Error", "failed to load question detail: " + err, 3);
    })
    $('#ModalQuestionDetail').modal('show');
    //createElementFromHTML('<img  class="image-fluid attachment-upload" data-toggle="modal" data-target="#ModalZoom" onclick="zoomImage(event)">')
}

function loadQuestionDetailAttachment(questionId) {
    Server.request("GET", "/api/question/attachmentList?id=" + questionId, null, true).then(function (result) {
        result = JSON.parse(result);
        document.getElementById("MQD_imageContainer").innerHTML = ""
        result.forEach(attc => {
            var img = createElementFromHTML('<img  class="image-fluid" data-toggle="modal" data-target="#ModalZoom" onclick="zoomImage(event)">')
            img.src = "/res/images/attachment/" + attc.attachmentId + ".png";
            img.title = attc.label;
            img.id = attc.attachmentId;
            var inp = createElementFromHTML('<input type="text" class="form-control" disabled>')
            inp.value = attc.label;
            var dv = createElementFromHTML('<div class="col-md-3 text-center"></div')
            dv.appendChild(inp)
            dv.appendChild(img)
            document.getElementById("MQD_imageContainer").appendChild(dv)
        })
    }).catch(function (err) {
        console.log(err)
    })
}

function loadAnswer(questionId) {
    Server.request("GET", "/api/question/answer/?id=" + questionId, null, true).then(
        function (result) {
            MQD_ansTable.clear()
            result = JSON.parse(result)
            result.forEach(ans => {
                var attach = "none"
                if (ans.attachmentId != null) {
                    attach = '<img class="image-fluid attachment-upload" data-toggle="modal" data-target="#ModalZoom" onclick="zoomImage(event)"'
                        + 'src="/res/images/attachment/' + ans.attachmentId + '.png">'
                }
                MQD_ansTable.row.add([
                    ans.answerText,
                    ans.relativeMark,
                    attach

                ])
            })
            MQD_ansTable.draw()
        }
    ).catch(function (err) {
        console.log(err)
    })
}
