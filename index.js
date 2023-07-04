const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let User = require('./user').userModel;
let Exercise = require('./user').exerciseModel;

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use((req, res, next) => {
  console.log(req.method, " ", req.path, " ", req.ip);
  next();
});
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  let uname = req.body.username;
  console.log('add user: ', uname);
  let user = new User({username: uname});
  user.save().then((doc) => {
    console.log('added', doc);
    res.json({
      username: uname,
      _id: user._id.toString()
    })
  }).catch((err) => {
    console.error(err);
  })
})

app.get('/api/users', (req, res) => {
  console.log('get user list');
  User.find({}, 'username').then((docs) => {
    res.json(docs);
  }).catch((err) => {
    console.log('cant get user list', err);
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  let findId = req.params._id;
  let excerciseToAdd = new Exercise({
    description: req.body.description,
    duration: req.body.duration,
    date: new Date(req.body.date)
  })
  console.log('add exercise to user ', findId);
  User.findById(findId).then((userDoc) => {
    userDoc.exercises.push(excerciseToAdd);
    userDoc.save().then((doc) => {
      console.log('exercise added', excerciseToAdd);
      res.json({
        description: req.body.description,
        duration: +req.body.duration,
        date: excerciseToAdd.date.toDateString(),
        username: doc.username,
        _id: doc._id.toString()
      })
    }).catch((err) => {
      console.log('save fail', err);
    })
  }).catch((err) => {
    console.log('cant find id', err);
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  let logId = req.params._id;
  console.log('retrieve logs of user', logId);
  User.findById(logId).then((logUser) => {
    let exerciseArray = JSON.parse(JSON.stringify(logUser.exercises));
    for (let elem of exerciseArray) {
      console.log(elem);
      elem.date = new Date(elem.date).toDateString();
      delete elem._id;
    }
    res.json({
      username: logUser.username,
      _id: logUser._id.toString(),
      count: logUser.countExercises(),
      log: exerciseArray
    })
  }).catch((err) => {
    console.error('cant find ID', err);
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
