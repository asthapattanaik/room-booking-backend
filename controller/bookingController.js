const Room = require("../models/Room");
const _ = require("lodash");

const TOTAL_ROOMS = 97;

// Get available rooms grouped by floor
async function getAvailableRooms() {
  const rooms = await Room.find({ isBooked: false }).sort("roomNumber");
  const floorMap = new Map();

  rooms.forEach(room => {
    if (!floorMap.has(room.floorNumber)) {
      floorMap.set(room.floorNumber, []);
    }
    floorMap.get(room.floorNumber).push(room);
  });

  return floorMap;
}

// Find contiguous rooms with minor gaps allowed
function findContiguousRooms(rooms, numRooms) {
  for (let i = 0; i <= rooms.length - numRooms; i++) {
    let selectedRooms = rooms.slice(i, i + numRooms);
    let roomNumbers = selectedRooms.map(r => r.roomNumber);

    let minRoom = Math.min(...roomNumbers);
    let maxRoom = Math.max(...roomNumbers);

    if (maxRoom - minRoom < numRooms + 1) { 
      return selectedRooms;
    }
  }
  return null;
}

// Find best rooms across multiple floors
function findBestMultiFloorRooms(floorMap, numRooms) {
  let bestChoice = null;
  let minTravelTime = Infinity;

  for (let [floor, rooms] of floorMap) {
    for (let i = 0; i <= rooms.length - numRooms; i++) {
      let travelTime = (floor - 1) * 2 + (numRooms - 1);
      if (travelTime < minTravelTime) {
        minTravelTime = travelTime;
        bestChoice = rooms.slice(i, i + numRooms);
      }
    }
  }
  return bestChoice;
}

// Book rooms based on available options
exports.bookRooms = async (req, res) => {
  const { numRooms } = req.body;
  if (numRooms < 1 || numRooms > 5) {
    return res.status(400).json({ error: "Invalid number of rooms. Must be between 1 and 5." });
  }

  const floorMap = await getAvailableRooms();

  console.log("Available rooms per floor:", [...floorMap.entries()]);

  for (let rooms of floorMap.values()) {
    const contiguousRooms = findContiguousRooms(rooms, numRooms);
    if (contiguousRooms) {
      await Room.updateMany({ _id: { $in: contiguousRooms.map(r => r._id) } }, { isBooked: true });
      return res.json({ message: "Rooms booked successfully", rooms: contiguousRooms });
    }
  }

  const bestRooms = findBestMultiFloorRooms(floorMap, numRooms);
  if (!bestRooms) return res.status(400).json({ error: "No suitable rooms available" });

  await Room.updateMany({ _id: { $in: bestRooms.map(r => r._id) } }, { isBooked: true });
  return res.json({ message: "Rooms booked across floors", rooms: bestRooms });
};

// Get all booked rooms
exports.getBookings = async (req, res) => {
  const bookedRooms = await Room.find({ isBooked: true });
  res.json(bookedRooms);
};

// Reset all bookings
exports.resetBookings = async (req, res) => {
  await Room.updateMany({}, { isBooked: false });
  res.json({ message: "All bookings cleared!" });
};

// Generate random occupancy
exports.generateRandomOccupancy = async (req, res) => {
  try {
    const rooms = await Room.find({}, { roomNumber: 1, _id: 1 });

    const shuffledRooms = _.shuffle(rooms);
    const totalToBook = Math.floor(Math.random() * rooms.length) + 1;
    const selectedRooms = shuffledRooms.slice(0, totalToBook);

    await Room.updateMany({}, { isBooked: false });

    await Room.updateMany(
      { _id: { $in: selectedRooms.map(room => room._id) } },
      { isBooked: true }
    );

    const bookedRooms = await Room.find({ isBooked: true });

    res.json({ message: `${totalToBook} rooms booked.`, bookedRooms });
  } catch (error) {
    console.error("Error generating random occupancy:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
