const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let User = require('./user');

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




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
