const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  family: {type: String,
  default: null},
  name: String,
  surname: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  status: {
    type: String,
    enum: ['Pending', 'Active'],
    default: 'Active',
  },
  confirmationCode: {
    type: String,
    unique: false,
  },
  roles: [
    {
      type: String,
      ref: 'Role',
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
