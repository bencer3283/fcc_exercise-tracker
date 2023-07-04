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
  let stamp = new Date(req.body.date).valueOf();
  let excerciseToAdd = new Exercise({
    description: req.body.description,
    duration: req.body.duration,
    date: stamp,
    parentId: findId
  });
  if (Number.isNaN(stamp)) {
    excerciseToAdd = new Exercise({
      description: req.body.description,
      duration: req.body.duration,
      parentId: findId
    });
  }
  excerciseToAdd.save().then((doc) => {}, (err) => {console.log(err);});
  console.log('add exercise to user ', findId);
  User.findById(findId).then((userDoc) => {
    userDoc.exercises.push(excerciseToAdd);
    userDoc.save().then((doc) => {
      console.log('exercise added', excerciseToAdd);
      res.json({
        description: req.body.description,
        duration: +req.body.duration,
        date: new Date(excerciseToAdd.date).toDateString(),
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
  console.log(req.query);
  let from = new Date(req.query.from).valueOf();
  let to = new Date(req.query.to).valueOf();
  let limit = +req.query.limit;
  let noTo = false;
  console.log('retrieve logs of user', logId);
  if (!Number.isNaN(from)) {
    console.log('query from ', req.query.from, 'to', req.query.to, 'with limit', req.query.limit);
    if (Number.isNaN(to)) {
      to = Date.now();
      noTo = true;
    } 
    if (limit < 1) limit = 100;
    Exercise.find({
      date: {
        $gte: from,
        $lte: to,
      },
      parentId: logId
    }, 'description duration date -_id')
    .limit(limit).exec()
    .then((doc) => {
      console.log(doc);
      let exerciseArray = JSON.parse(JSON.stringify(doc));
      for (let elem of exerciseArray) {
        elem.date = new Date(elem.date).toDateString();
      }
      User.findById(logId).then((usr) => {
        if (noTo) {
          res.json({
          username: usr.username,
          _id: usr._id.toString(),
          count: exerciseArray.length,
          from: new Date(req.query.from).toDateString(),
          log: exerciseArray
        })
        }
        else {
          res.json({
            username: usr.username,
            _id: usr._id.toString(),
            count: exerciseArray.length,
            from: new Date(req.query.from).toDateString(),
            to: new Date(req.query.to).toDateString(),
            log: exerciseArray
          })
        }
        
      });
    })
    .catch((err) => {console.log('query fail', err)});
  }
  else {
  User.findById(logId).then((logUser) => {
    let exerciseArray = JSON.parse(JSON.stringify(logUser.exercises));
    for (let elem of exerciseArray) {
      elem.date = new Date(elem.date).toDateString();
      delete elem._id;
      delete elem.parentId;
      delete elem.__v;
    }
    res.json({
      username: logUser.username,
      _id: logUser._id.toString(),
      count: logUser.countExercises(),
      log: exerciseArray
    })
  }).catch((err) => {
    console.error('cant find ID', err);
  })}
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
