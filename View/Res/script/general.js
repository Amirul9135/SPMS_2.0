var SelectSearchCacheVal = "";
var SelectSearchTimeout = null;
function SSFocus(e) {
    var list = document.getElementById(e.target.dataset.list);
    if (event.type == "focus") {
        list.style.transform = "scaleY(1)";
    }
    else {
        if (list.dataset.selected != '-1') {
            e.target.value = SelectSearchCacheVal;
        }
        else {
            e.target.value = "";
        }
        setTimeout(function () { list.style.transform = "scaleY(0)"; }, 200)
    }
}
function SSItemClick(e) {
    if (e.target.tagName == "LI") {
        e.target.parentElement.dataset.selected = e.target.id;
        SelectSearchCacheVal = e.target.innerHTML.trim();
        e.target.parentElement.parentElement.children[0].value = e.target.innerHTML.trim();
        e.target.parentElement.parentElement.children[0].dispatchEvent(new Event("play"));

    }

}
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function SSKeyHandler(e) {
    var list = document.getElementById(e.target.dataset.list);
    list.classList.add("select-search-blank")
    if (SelectSearchTimeout)//if exist rene
        clearTimeout(SelectSearchTimeout);
    SelectSearchTimeout = setTimeout(function () {
        SSFilter(list, e.target.value);
    }, 300);

}
function SSFilter(list, key) {
    list.querySelectorAll("li").forEach(listItem => {
        if (listItem.innerHTML.toLowerCase().includes(key.toLowerCase())) {
            listItem.removeAttribute("hidden")
        }
        else {
            listItem.setAttribute("hidden", "");
        }
    });
    list.classList.remove("select-search-blank");
}

function getPostcodes(statecode) {
    return new Promise(function (resolve, reject) {
        if (!statecode)
            return reject("invalid state code")
        Server.request("GET", "/api/address/postcode?stateCode=" + statecode, null, false).then(function (result) {
            resolve(result)
        }).catch(function (err) {
            reject(err)
        })
    })
}

function getAreaInPostcode(postcode) {
    return new Promise(function (resolve, reject) {
        if (!postcode)
            return reject("invalid state code")
        Server.request("GET", "/api/address/area?postcode=" + postcode, null, false).then(function (result) {
            resolve(result)
        }).catch(function (err) {
            reject(err)
        })
    })
}

function enforceMinMax(el) {
    if (el.value != "") {
        if (parseInt(el.value) < parseInt(el.min)) {
            el.value = el.min;
        }
        if (parseInt(el.value) > parseInt(el.max)) {
            el.value = el.max;
        }
    }
}

function preventDecimal(el) {
    if (el.key == '.') {
        el.preventDefault()
    }
}

async function verifyAccount() {
    var res = await Server.request("GET", '/api/account/verify', null, true).catch(async function (err) {
        console.log(err)
        await Swal.fire({
            type: 'Error',
            title: 'Account Verification Failed',
            text: 'Relog and try again'
        })
        window.location.href = "./login";
        return;
    })
    res = JSON.parse(res)
    localStorage.setItem("uid", res.id);
    localStorage.setItem("uname", res.name);
    localStorage.setItem("utype", res.type);
    return res;
}