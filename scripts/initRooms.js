//To populate with rooms
const mongoose = require("mongoose");
const Room = require("../models/room");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

  const MAX_ROOMS_PER_FLOOR = 10;
  const LAST_FLOOR_ROOMS = 7;

async function initializeRooms() {
  await Room.deleteMany({});

  let rooms = [];
  for (let floor = 1; floor <= 10; floor++) {
    let numRooms = (floor === 10) ? LAST_FLOOR_ROOMS : 7;
    for (let i = 1; i <= numRooms; i++) {
      rooms.push({ roomNumber: floor * 100 + i, floorNumber: floor, isBooked: false });
    }
  }

  await Room.insertMany(rooms);
  console.log("Rooms initialized!");
  mongoose.connection.close();
}

initializeRooms();
