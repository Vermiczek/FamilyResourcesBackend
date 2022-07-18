import cookieParser from 'cookie-parser';
const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  surname: String,
  familyFunds: Number,
  familyId: {
    type: String,
    unique: true,
  },
  invitationCode: {
    type: String,
    unique: false,
  },
  members: [
    {
      type: Object,
      ref: 'Member',
    },
  ],
});

module.exports = mongoose.model('family', familySchema);
