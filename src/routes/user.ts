import e, { Request } from 'express';
import bcrypt from 'bcrypt';
import express from 'express';
import { validate } from 'class-validator';
const router = express.Router();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
interface IGetUserAuthInfoRequest extends Request {
  user: {
    email: string;
  };
}



const validateEmail = (email: string) => {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
};



router.post('/token', (req:IGetUserAuthInfoRequest, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = jwt.sign({email: user[0].email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '99999s' });
    const refreshToken = jwt.sign({email: user[0].email}, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
  })
})


router.post('/register', async (req, res) => {
  if (!validateEmail(req.body.email)) {
    return res.status(401).json({ message: 'Wrong mail' });
  }
  const userTest = await User.findOne({ email: req.body.email });
  if (userTest !== null) return res.status(401).json({ message: 'email taken' });
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let confirmationCodeGen = '';
  for (let i = 0; i < 25; i++) {
    confirmationCodeGen += characters[Math.floor(Math.random() * characters.length)];
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    confirmationCode: confirmationCodeGen,
    password: hashedPassword,
    surname: req.body.surname,
    family: null,
  });
  try {
    const newUser = await user.save();
    res.status(201).json({ user: newUser, success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/registerAdmin', async (req, res) => {
  if (!validateEmail(req.body.email)) {
    return res.status(401).json({ message: 'Wrong mail' });
  }
  const userTest = await User.findOne({ email: req.body.email });
  if (userTest !== null) return res.status(401).json({ message: 'email taken' });
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let confirmationCodeGen = '';
  for (let i = 0; i < 25; i++) {
    confirmationCodeGen += characters[Math.floor(Math.random() * characters.length)];
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    confirmationCode: confirmationCodeGen,
    password: hashedPassword,
    surname: req.body.surname,
    roles: ['admin'],
    family: null,
  });
  try {
    const newUser = await user.save();
    res.status(201).json({ user: newUser, success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//login user
router.post('/login', async (req, res) => {
  if (!validateEmail(req.body.email)) {
    return res.status(401).json({ message: 'Wrong mail' });
  }
  const user = await User.find({ email: req.body.email });
  console.log(user);

  try {
    if (user.length === 0) {
      return res.status(400).send({ message: 'Cannot find user' });
    }

    if (user.status === 'Pending') {
      return res.status(401).send({
        message: 'Pending Account. Please Verify Your Email!',
      });
    }
    if (await bcrypt.compare(req.body.password, user[0].password)) {
      try {
        const token = jwt.sign({email: user[0].email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '99999s' });
        const refreshToken = jwt.sign({email: user[0].email}, process.env.ACCESS_TOKEN_SECRET);
        res
        .status(200)
        .cookie('token', token, {
          domain: 'localhost',
          path: '/',
        })
        .json({
          message: 'Login succesful!',
          successful: true,
          user: user[0].email,
          refreshToken: { refreshToken },
        });
        
      } catch (e) {
        console.log(e);
      }
    
    } else {
      res.status(200).json({ message: 'Wrong password!', successful: false });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
