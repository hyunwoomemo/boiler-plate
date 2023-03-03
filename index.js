const express = require('express');
const app = express();
const port = 5000
// Body 데이터를 분석(parse)해서 req.body로 출력
const bodyParser = require('body-parser');

const config = require('./config/key')

const { User } = require('./models/User');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
app.use(bodyParser.json());

const mongoose = require('mongoose')

mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => res.send('hello'))

app.post('/register', (req, res) => {
  // 회원 가입 할 때 필요한 정보들을 client에서 가져오면
  // 그것들을 데이터 베이스에 넣어준다.

  // req.body 데이터를 읽어올 수 있는 것은 'body-parser' 덕분
  const user = new User(req.body);

  /*   user.save((err, userInfo) => {
      if (err) return res.json({ success: false, err })
      return res.status(200).json({
        success: true
      })
    }) */

  user.save().then(() => {
    res.status(200).json({
      success: true
    })
  }).catch((err) => {
    return res.json({ success: false, err })
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}`))

