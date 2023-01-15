const express = require('express');
const router = express.Router();
const Topic = require("../Model/entity/Topic");
const Auth = require("./Middleware/Authenticate")

router.post('/register', Auth.userType([3]), function (req, res) {
    var newTopic = new Topic();
    newTopic.setStrSubjectCode(req.body.subjectCode);
    newTopic.setStrTopicTitle(req.body.topicTitle);
    console.log(req.body);
    var promiseRegister = newTopic.registerTopic();
    //calback function when resolve and reject
    promiseRegister.then(function (value) { //.then means resolve (no error)
        res.send("Success");
    }).catch(function (value) { //.catch means promise is rejected (got some errors)
        res.status(400).send(value);
    });
});

router.post('/update', Auth.userType([3]), function (req, res) {
    var updateTopic = new Topic();
    updateTopic.setStrTopicTitle(req.body.topicTitle);
    updateTopic.setIntTopicId(req.body.topicId);

    var update = updateTopic.updateTopic();
    update.then(function (value) {//berjaya
        res.status(200).send();
    }).catch(function (value) {//no change atau error
        res.status(400).send(value);
    });
});

router.post('/getTopic', Auth.userType(), function (req, res) {
    var topicId = req.query.topicId;
    var promiseAll = Topic.getTopic(topicId);

    promiseAll.then(function (value) {
        console.log(value);
        return res.send(value);
    }).catch(function (value) {
        console.log(value);
        return res.status(400).send(value);
    });
});


router.post('/delete', Auth.userType([3]), function (req, res) {
    var delTopic = new Topic();
    delTopic.setIntTopicId(req.body.topicId);

    var del = delTopic.deleteTopic();
    del.then(function (value) {//berjaya 
        res.status(200).send();
    }).catch(function (value) {//no change atau error 
        res.status(400).send(value);
    });
});

router.get('/', Auth.userType(), function (req, res) {
    //get topic by id
    var id = req.query.id;
    if (!id || id < 0) {
        return res.status(400).send("invalid id");
    }
    Topic.loadFromDb(id).then(function (foundTopic) {
        return res.status(200).send(foundTopic.toJSON());

    }).catch(function (value) {
        return res.status(404).send("not found");
    })
})

router.get('/allTopic', Auth.userType(), function (req, res) {
    var promiseAll = Topic.getAll();

    promiseAll.then(function (value) {
        console.log(value);
        res.send(JSON.stringify(value));
    }).catch(function (value) {
        console.log(value);
        res.status(400).send(value);
    });
});

router.post('/getTopicBySubject', Auth.userType(), function (req, res) {
    Topic.getTopicBySub(req.body.subjectCode).then(
        function (value) {
            return res.status(200).send(value);
        }
    ).catch(function (value) {
        return res.status(500).send(value);
    })
})

module.exports = router;