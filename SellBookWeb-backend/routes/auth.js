var express = require("express");
var router = express.Router();
let jwt = require('jsonwebtoken')
let bcrypt = require('bcrypt')
let userController = require("../controllers/users")
let userModel = require("../schemas/users")
let { checkLogin } = require('../utils/authHandler')
let crypto = require('crypto')
let { sendMail } = require('../utils/mailHandler')
let mongoose = require('mongoose')


router.post('/register', async function (req, res, next) {
  let newUser = await userController.CreateAnUser(
    req.body.username,
    req.body.password,
    req.body.email,
    '69a4f929f8d941f2dd234b88'
  )
  res.send(newUser)
});
// Test route for debugging
router.post('/test-login', async function (req, res, next) {
  try {
    let { email } = req.body;
    console.log('Test login for:', email);
    
    // Direct collection query
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    const user = await collection.findOne({ email: email });
    
    console.log('Collection query result:', user ? 'FOUND' : 'NOT FOUND');
    
    if (user) {
      res.send({ message: 'User found', email: user.email, role: user.role });
    } else {
      res.status(401).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).send({ message: error.message });
  }
});

router.post('/login', async function (req, res, next) {
  try {
    let { email, password, role } = req.body;
    
    // Direct query for compatibility - handle both old Java data and new Node.js data
    let getUser = await userModel.findOne({ email: email });
    if (!getUser) {
      res.status(401).send({
        message: "Email không tồn tại hoặc thông tin đăng nhập sai"
      })
      return;
    }
    
    // Handle missing username for old users
    if (!getUser.username) {
      getUser.username = getUser.email.split('@')[0]; // Generate username from email
    }
    
    let result = bcrypt.compareSync(password, getUser.password);
  if (result) {
    let token = jwt.sign({
      id: getUser._id,
      exp: Date.now() + 3600 * 1000
    }, "HUTECH")
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    });
    res.send({
      accessToken: token,
      refreshToken: token, // For now, same token
      user: {
        id: getUser._id,
        name: getUser.name || getUser.username,
        email: getUser.email,
        role: getUser.role,
        phone: getUser.phone || '',
        avatar: getUser.avatar,
        active: getUser.active
      }
    })
  } else {
    res.status(401).send({
      message: "Email không tồn tại hoặc thông tin đăng nhập sai"
    })
  }
  } catch (error) {
    res.status(500).send({
      message: "Lỗi server"
    })
  }
});
//localhost:3000
router.get('/me', checkLogin, async function (req, res, next) {
  let user = await userController.FindByID(req.userId);
  res.send(user)
});
router.post('/logout', checkLogin, function (req, res, next) {
  res.cookie('token', null, {
    maxAge: 0,
    httpOnly: true
  })
  res.send("logout")
})
router.post('/changepassword', checkLogin, async function (req, res, next) {
  let { oldPassword, newPassword } = req.body;
  let user = await userController.FindByID(req.userId);
  if (bcrypt.compareSync(oldPassword, user.password)) {
    user.password = newPassword;
  }
  await user.save();
  res.send("da cap nhat password")
})
router.post('/forgotpassword', async function (req, res, next) {
  let email = req.body.email;
  let user = await userController.FindByEmail(email);
  if (user) {
    user.forgotPasswordToken = crypto.randomBytes(31).toString('hex');
    user.forgotPasswordTokenExp = new Date(Date.now() + 10 * 60 * 1000);
    console.log(user.forgotPasswordToken);
    await user.save();
    res.send("gui mail reset pass")

    await sendMail(user.email, "http://localhost:3000/auth/resetpassword/" + user.forgotPasswordToken)
    return;
  }
  res.send("email khong ton tai")
})
router.post('/resetpassword/:token', async function (req, res, next) {
  let token = req.params.token;
  let newPassword = req.body.password;
  let getUser = await userController.FindByToken(token);
  console.log(getUser);
  if (getUser) {
    getUser.password = newPassword;
    getUser.forgotPasswordToken = '';
    getUser.forgotPasswordTokenExp = null;
    await getUser.save()
    res.send(" da cap nhat")
  } else {
    res.send("loi token")
  }
})


module.exports = router;


//mongodb
