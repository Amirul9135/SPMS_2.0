class Server {
    constructor() {
    }

    static login(id, password) {
        if (id != "" && password != "") {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/account/login");
            xhr.setRequestHeader("Content-Type", "application/json");
            var data = JSON.stringify({
                "accountId": id,
                "password": password
            });
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var jsonData = JSON.parse(xhr.responseText);
                    localStorage.setItem("jwtT", xhr.getResponseHeader("jwtT"));
                    localStorage.setItem("jwtP", xhr.getResponseHeader("jwtP"));
                    localStorage.setItem("uid", jsonData.user.id);
                    localStorage.setItem("uname", jsonData.user.name);
                    localStorage.setItem("utype", jsonData.user.type);
                    window.location.href = "./home";
                }
                else if (xhr.readyState == 4 && xhr.status != 200) {
                    Swal.fire({
                        type: 'error',
                        title: 'Invalid Credentials',
                        text: 'Please check and try again'
                    })

                    document.getElementById("loginImage").classList.add("loginError");
                }
            };
            xhr.send(data);
        }

    }
    static logout() {
        this.request('GET', '/api/account/logout', null, true).then(function (value) {
            localStorage.removeItem("jwtT");
            localStorage.removeItem("jwtP");
            localStorage.removeItem("uid");
            localStorage.removeItem("uname");
            localStorage.removeItem("utype");
            window.location.href = "./login";
        }).catch(function (value) {
            console.log(value)
        })
    }

    static request(method, url, data, auth) {
        //method: GET/POST etc
        //url for path/routes/api
        //data JSON OBJECT
        //auth true for authentication required api/ false for public api
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            if (auth) {
                if (localStorage.getItem("jwtT") != null && localStorage.getItem("uid") != null && localStorage.getItem("jwtP") != null) {
                    xhr.setRequestHeader("jwtT", localStorage.getItem("jwtT"));
                    xhr.setRequestHeader("jwtP", localStorage.getItem("jwtP"));
                    xhr.setRequestHeader("uid", localStorage.getItem("uid"));
                }
                else {
                    console.log("unauthorized: no token");
                    reject("unauthorized");
                }
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {//request finished
                    if (xhr.status == 200) {//good request
                        resolve(xhr.responseText);
                    }
                    else if (xhr.status == 401) {
                        reject("unauthorized: " + xhr.responseText);
                    }
                    else {
                        reject(xhr.responseText);
                    }
                }
            }
            if (data != null) {
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify(data));
            }
            else {
                xhr.send();
            }
        });
    }
}