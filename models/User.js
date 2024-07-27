const mongoose = require('mongoose');
const MainSchema = require('./Main');
const Main = new mongoose.model('Main', MainSchema, 'users');

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Please enter a userName'],
  },

  password: {
    type: String,
    required: [true, 'Please enter your password'],
  },

  userState: {
    type: String,
    default: 'loggedOut',
  },

  mainStore: {
    type: {},
    default: new Main(),
  },

  groups: {
    type: Array,
    default: [],
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema, 'users');
