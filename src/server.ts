import express from 'express';
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth')
require('dotenv').config();

var cors = require('cors');

export const app = express();
const mongoose = require('mongoose');
var corsOptions = {
  credentials: true,
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(express.json());

const userRouter = require('./routes/user');
const familyRouter = require('./routes/family');
app.use(cors(corsOptions));
app.use(cookieParser());
app.use('/user', cors(corsOptions), userRouter);
app.use('/family', auth, cors(corsOptions), familyRouter);
app.listen(3000, () => console.log('Server Started'));
