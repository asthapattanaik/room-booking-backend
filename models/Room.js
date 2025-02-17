const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: Number,
  floorNumber: Number,
  isBooked: { type: Boolean, default: false },
});

const room = mongoose.model("Room", roomSchema);
module.exports = room;