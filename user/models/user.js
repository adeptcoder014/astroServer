const mongoose = require("mongoose");

//===================================
const userSchema = new mongoose.Schema({
  name: String,
  dob: String,
  time: String,
  location: {
    name: String,
    lat: Number,
    long: Number,
  },
  planets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Planet'
  }],
  houses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House'
  }],
  createdAt: String



});



const model = mongoose.model('User', userSchema);
module.exports = model;

