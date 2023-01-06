function loading(boolActive) {
    if (boolActive) {
        document.getElementById("dv_sectLoader").classList.add("sect_loader_active");
    }
    else {

        document.getElementById("dv_sectLoader").classList.remove("sect_loader_active");
    }
}

async function navigate(page, push) {
    //if (page.includes("?")) {//serach param

    // }
    //show loader
    loading(true)
    if (push == null)//if not defined assume true
        push = true;

    if (page == "" || page == "/") {//if root back to home
        page = '/home';
    }

    //highlight/unhighlight menu
    document.getElementById("side_menu").querySelectorAll(".active").forEach(actvElemenet => {
        actvElemenet.classList.remove('active');
    })
    document.getElementById("side_menu").querySelectorAll("p").forEach(element => {
        if (element.title == page) {
            element.classList.add('active');
            if (element.parentElement.parentElement.parentElement.children[0].classList.contains("side-menu__item")) {
                element.parentElement.parentElement.parentElement.children[0].classList.add("active");
                element.parentElement.parentElement.parentElement.classList.add("is-expanded");
            }
        }
    });

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/pages' + page);

    if (localStorage.getItem("jwtT") != null && localStorage.getItem("uid") != null && localStorage.getItem("jwtP") != null) {
        xhr.setRequestHeader("jwtT", localStorage.getItem("jwtT"));
        xhr.setRequestHeader("jwtP", localStorage.getItem("jwtP"));
        xhr.setRequestHeader("uid", localStorage.getItem("uid"));
    }
    else {
        console.log("unauthorized: no token");
        await Swal.fire({
            type: 'error',
            title: 'Unauthorized Access'
        })
        window.location.href = "./login";
        return
    }
    xhr.onreadystatechange = async function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200 || xhr.status == 304) {
                document.getElementById("main_container").innerHTML = "";
                $('#main_container').html(xhr.responseText);
                document.querySelectorAll(".side-app")[0].dispatchEvent(new Event("load"));
                if (push) {
                    if (window.history.state != page)
                        window.history.pushState(page, '', '.' + page);
                }
            }
            else if (xhr.status == 400) {
                console.log(xhr.responseText)
                await Swal.fire({
                    type: 'error',
                    title: 'failed to load page'
                })
            }
            else if (xhr.status == 401) {
                console.log(xhr.responseText)
                var msg = ""
                var jsonRes = {}
                try {
                    jsonRes = JSON.parse(xhr.responseText)
                    if (jsonRes.hasOwnProperty('error')) {
                        msg = jsonRes.error;
                    }
                }
                catch (e) {

                }
                var unauthAct = await Swal.fire({
                    type: 'error',
                    title: 'Unauthorized Access',
                    text: msg,
                    showCancelButton: 'true',
                    cancelButtonText: 'Back to login'
                })
                if (unauthAct.dismiss) {
                    if (unauthAct.dismiss == "cancel") {
                        window.location.href = "./login";
                    }
                }
                else if (unauthAct.value) {
                    navigate('/home')
                }
            }
            //remove loader
            loading(false);
        }
    }

    xhr.send();
}
//forward/backward listener
window.addEventListener('popstate', function (e) {
    if (e.state != null) {
        console.log("req page" + e.state);
        navigate(e.state, false);

    }
    else {
        navigate('/', false);
    }
});
//reload listener
window.onbeforeunload = function () {
    sessionStorage.setItem("nvp", window.location.pathname + window.location.search);
}
window.onload = function () {
    if (sessionStorage.getItem("nvp") != null) {
        navigate(sessionStorage.getItem("nvp"), false);
        sessionStorage.removeItem("nvp");
    }
    else {
        navigate(window.location.pathname + window.location.search, false);
    }
}


function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

function findIndexofJSAR(jsonArr, field, key) {
    for (var i = 0; i < jsonArr.length; i++) {
        if (jsonArr[i][field] == key)
            return i;
    }
    return -1;
}

function displayValidationError(value) {
    var message = ""
    Object.keys(value["validationError"]).forEach(function (key) {
        message += key + " : " + value["validationError"][key] + "<br>"
    })
    Message.createNew("Validation Error", message, 3);
}

function zoomImage(event) {
    document.getElementById("imageZoom").src = event.target.src;
    document.getElementById("imageZoomTitle").innerHTML = event.target.title;
}

class Message {
    static str1 = '<div class="col-md-8"><div class="alert alert-'
    static str2 = ' mb-4"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button><strong>'
    static str3 = '</strong><hr class="message-inner-separator"><p>'
    static str4 = '</p></div></div>';
    static strType = ["success", "info", "warning", "danger"]
    static createNew(title, content, type) {
        var newMSG = createElementFromHTML(this.str1 + this.strType[type] + this.str2 + title + this.str3 + content + this.str4)
        setTimeout(function () { newMSG.remove() }, 4000)
        document.getElementById("message_container").appendChild(newMSG);
    }
}

