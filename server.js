const express = require('express');
const app = express();
const port = 3001
// Body 데이터를 분석(parse)해서 req.body로 출력
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');

const fs = require('fs');
const { join, resolve } = require('path');
const dotenv = require('dotenv');

const bcrypt = require('bcrypt');
const saltRounds = 10;

// 설정 파일 내용 가져오기 
const configFileName = process.env.NODE_ENV !== 'production' ? '.env.server.development' : '.env.server.production';
const configPath = join(resolve(), configFileName);

// 파일이 존재하지 않을 경우 강제로 에러 발생함.
if (!fs.existsSync(configPath)) {
  try {
    throw new Error();
  } catch (e) {
    console.error('================================');
    console.error('|   Configuration Init Error   |');
    console.error('================================');
    console.error('환경설정 파일을 찾을 수 없습니다. 환경설정 파일의 경로를 확인하세요.');
    console.error(`환경설정 파일 경로: ${configPath}`);
    console.error('프로그램을 종료합니다.');
    process.exit(1);
  }
}


// 설정파일을 로드한다.
dotenv.config({ path: configPath });

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text()); // TEXT 형식의 파라미터 수신 가능.
app.use(bodyParser.json()); // JSON 형식의 파라미터 수신 가능.

/** 쿠키를 처리할 수 있는 객체 연결 */
// cookie-parser는 데이터를 저장, 조회 할 때 암호화 처리를 동반한다.
// 이 때 암호화에 사용되는 key 문자열을 개발자가 정해야 한다.
app.use(cookieParser(process.env.COOKIE_ENCRYPT_KEY));

const db = mysql.createConnection({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_SCHEMA,
});




app.get('/', (req, res) => res.send('hello'))

// 회원가입 기능 구현

app.post('/register', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const pw = req.body.password;

  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(pw, salt, function (err, hash) {
      db.query('INSERT INTO user (name, email, password) VALUES (?, ?, ?)', [name, email, hash],
        (err, result) => {
          if (err) {
            console.log(err)
          } else {
            res.send('Values Inserted');
          }
        }
      );
    })
  })

})


// 로그인 기능 구현

app.post('/login', (req, res) => {
  // usermail 값에 일치하는 데이터가 있는지 select 문
  // userpass 암호화해서 쿼리 결과의 패스워드랑 일치하는지를 체크
  const { email, password } = req.body;
  db.query(`select * from user where email ='${email}'`, (err, rows, fields) => {
    if (rows !== undefined) {
      console.log(rows);
      if (rows[0] === undefined) {
        console.log(rows[0])
        res.send(null)
      } else {
        bcrypt.compare(password, rows[0].password, function (err, result) {
          if (result === true) {
            res.send(rows[0])
          } else {
            res.send('실패')
          }
        });
      }
    } else {
      res.send('실패')
    }
  })
})

/* app.post('/login', (req, res) => {

  // 요청된 이메일이 데이터베이스에 있는지 확인

  User.findOne({ email: req.body.email }).then(user => {
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

      // 비밀번호까지 같다면 Token을 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에 ? 쿠키, 로컬스토리지 중 선택
        // 쿠키에 저장하는 것으로 선택

        res.cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id })

      })

    })
  }).catch((user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
  })

}) */



app.listen(port, () => console.log(`Example app listening on port ${port}`))

