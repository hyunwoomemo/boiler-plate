const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const saltRounds = 10

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    // ex - 0이면 관리자 1이면 유저라고 지정할 수 있음
    type: Number,
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: {
    type: Number
  }
})

userSchema.pre('save', function (next) {
  let user = this;

  // 비밀번호를 바꿀 때만 암호화해야함
  if (user.isModified('password')) {
    // 비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err)
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err)
        // Store hash in your password DB.
        user.password = hash
        next()
      });
    });
  } else {
    next()
  }
})

const User = mongoose.model('User', userSchema)

module.exports = { User }