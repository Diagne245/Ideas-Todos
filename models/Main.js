const mongoose = require('mongoose');

const MainSchema = new mongoose.Schema({
  focusText: {
    type: String,
    default: 'Your Motivation Text Here',
  },

  items: {
    type: Array,
    index: true,
    default: [],
  },
});

module.exports = MainSchema;
