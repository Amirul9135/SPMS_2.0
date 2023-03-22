const express = require('express');
const path = require('path');
const app = express();

app.use(express.json({ extended: false }));



app.set('views', './View/Pages');
app.set('view engine', 'ejs');
app.use('/pages', require("./Controller/pages"));

app.use('/api/question', require("./Controller/questionApi"))
app.use('/api/address', require("./Controller/addressApi"))
app.use('/api/account', require("./Controller/accountApi"))
app.use('/api/subject', require("./Controller/subjectApi"))
app.use('/api/school', require("./Controller/schoolApi"))
app.use('/api/questionSet', require("./Controller/questionSetApi"))
//app.use('/api/schoolteacher', require("./Controller/schoolteacherApi")) 
app.use('/api/class', require("./Controller/classApi"))
app.use('/api/topic', require("./Controller/topicApi"))
//app.use('/api/classname', require("./Controller/classnameApi"))
app.use('/api/class', require("./Controller/classApi"))
//app.use('/api/homeroomteacher', require("./Controller/HomeroomApi"))
//app.use('/api/schoolstudent', require("./Controller/schoolstudentApi"))
app.use('/api/assessment', require('./Controller/assessmentApi'))


app.use('/res/',
    function (req, res, next) {
        res.setHeader('Cache-Control', `max-age=31536000, no-cache`);
        next();
    }
    , express.static('View/Res'));


app.get('/login', function (req, res) {
    return res.sendFile(path.join(__dirname, 'View', 'login.html'));
})

app.get('/favicon.ico', function (req, res) {
    return res.sendFile(__dirname + '\\View\\Res\\assets\\images\\brand\\favicon.ico')
})

app.get('/*', function (req, res) {
    if (/\.{1}/.test(req.originalUrl)) {
        //any path ada . means file la so kalau masuk sini not found 404 
        return res.status(404).send();
    }
    else {
        console.log("index sent");
        return res.status(202).sendFile(path.join(__dirname, '/View/index.html'));
    }
})

module.exports = app;
