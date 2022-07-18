import e, { Request } from 'express';
import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
const Family = require('../models/family.model');
const familyServices = require('../services/family');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
interface IGetUserAuthInfoRequest extends Request {
  user: {
    email: string;
  };
}


router.post('/create', async (req: IGetUserAuthInfoRequest, res) => {
  let invitationCodeGen = familyServices.generateInvitationCode();
  let idCodeGen = '';
  console.log(req.user.email);
  while (1) {
    idCodeGen = familyServices.generateFamilyId();
    const familyRepetition = await Family.findOne({ familyId: idCodeGen });
    if (familyRepetition === null) break;
  }
  const hashedPassword = await bcrypt.hash(invitationCodeGen, 10);
  // const family = new Family({ surname: req.body.surname, familyId: idCodeGen, invitationCode: hashedPassword, familyFunds: 1000 });
  // if (family === null) {
  //   res.status(400).json({ message: 'family not found' });
  // }
  try {
    const user = await User.findOne({ email: req.user.email });
    if (user === null) {
      return res.status(403).json({ message: "user doesn't exist" });
    } else if (user.family !== null) {
      return res.status(403).json({ message: 'user already in family' });
    }

    try {
      user.family = idCodeGen;
      await user.save();
      const family = new Family({ surname: req.body.surname, familyId: idCodeGen, invitationCode: hashedPassword, familyFunds: 1000 });
      family.members.push({ name: user.name, surname: user.surname, email: user.email });
      const newFamily = await family.save();
      return res.status(201).json({ code: invitationCodeGen, user: newFamily, success: true });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/join', async (req: IGetUserAuthInfoRequest, res) => {
  const family = await Family.findOne({ familyId: req.body.id });
  const user = await User.findOne({ email: req.user.email });
  console.log(req.user.email);
  console.log(user);

  if (family === null) {
    return res.status(400).send({ message: 'Cannot find family' });
  }
  if (user === null) {
    return res.status(400).send({ message: 'Cannot find user' });
  }

  console.log(req.body.password);
  try {
    if (await bcrypt.compare(req.body.password, family.invitationCode)) {
      try {
        for (let i = 0; i < family.members.length; i++) {
          if (family.members[i].email) {
            return res.status(400).send({ message: 'User already inf family!' });
          }
        }
        user.family = family.familyId;
        await user.save();
        family.members.push({ name: user.name, surname: user.surname, email: user.email });
        await family.save();
        return res.status(200).send({ message: 'User joined!' });
      } catch (err) {
        return res.status(400).send({ message: err });
      }
    } else {
      return res.status(403).send({ message: 'Wrong invitation code!' });
    }
  } catch (err) {
    return res.status(400).send({ message: 'Wrong password data!' });
  }
});

router.post('/leave', async (req: IGetUserAuthInfoRequest, res) => {
  const user = await User.findOne({ email: req.user.email });
  const family = await Family.findOne({ familyId: user.family });
  try {
    if (family === null) {
      return res.status(400).send({ message: 'Cannot find family' });
    }
    if (user === null) {
      return res.status(400).send({ message: 'Cannot find user' });
    }
    if (user.family === null) {
      return res.status(400).send({ message: "User isn't in a family" });
    }
    for (let i = 0; i < family.members.length; i++) {
      if (family.members[i].email) {
        user.family = null;
        await user.save();
        family.members.splice(i, 1);
        await family.save();
        return res.status(200).send({ message: 'User left the family' });
      }
      return res.status(400).send({ message: 'User not in family' });
    }
  } catch (e) {
    console.log(e);
  }
  family.familyFunds += req.body.expenses;
  await family.save();
});

router.post('/addExpenses', async (req: IGetUserAuthInfoRequest, res) => {
  if (isNaN(req.body.expenses)) return res.status(400).json({ message: 'Wrong fund format!' });
  if (req.body.expenses < 0) return res.status(400).json({ message: "Can't add funds as regular user!" });

  const user = await User.findOne({ email: req.user.email });
  const family = await Family.findOne({ familyId: user.family });
  console.log(family);
  try {
    if (family === null) {
      return res.status(400).send({ message: 'Cannot find family' });
    }
    if (user === null) {
      return res.status(400).send({ message: 'Cannot find user' });
    }
  } catch (e) {
    console.log(e);
  }
  family.familyFunds -= req.body.expenses;
  await family.save();
});

router.post('/addFunds', async (req: IGetUserAuthInfoRequest, res) => {
  if (isNaN(req.body.funds)) return res.status(400).json({ message: 'Wrong fund format!' });
  const user = await User.findOne({ email: req.user.email });
  const family = await Family.findOne({ familyId: req.body.id });

  if (user.roles[0] !== 'admin') {
    return res.status(400).send({ message: 'Insufficient permissions' });
  }
  try {
    if (family === null) {
      return res.status(400).send({ message: 'Cannot find family' });
    }
    if (user === null) {
      return res.status(400).send({ message: 'Cannot find user' });
    }
    family.familyFunds += req.body.funds;
    await family.save();
    return res.status(400).send({ message: 'Added ' + req.body.funds });
  } catch (e) {
    console.log(e);
  }
  family.familyFunds += req.body.funds;
  await family.save();
});

router.post('/data', async (req: IGetUserAuthInfoRequest, res) => {
  const user = await User.findOne({ email: req.user.email });
  const family = await Family.find({ familyId: user.family });
  console.log("DATA");
  console.log(user);
  console.log(family);

  try {
    return res.status(200).json(family);
  } catch (err) {
    console.log(err);
  }
});

router.post('/allData', async (req: IGetUserAuthInfoRequest, res) => {
  const families = await Family.find();
  const user = await User.findOne({ email: req.body.email });

  if (user.roles[0] !== 'admin') {
    return res.status(403).send({ message: 'Insufficient permissions' });
  }
  try {
    return res.status(200).json(families);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
