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
        duration: req.body.duration,
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


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
