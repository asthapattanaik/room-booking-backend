require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { bookRooms, getBookings, resetBookings, generateRandomOccupancy } = require("./controller/bookingController");

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: "*" })); 
// app.use(
//   cors({
//     origin: "https://room-booking-system-tau.vercel.app",
//     methods: "GET,POST,PUT,DELETE",
//     allowedHeaders: "Content-Type,Authorization",
//   })
// );

app.get("/", (req, res) => {
    res.send("Room Booking System");
  });
  
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/bookRooms", bookRooms);
app.get("/getBookings", getBookings);
app.delete("/resetBookings", resetBookings);
app.post("/randomOccupancy", generateRandomOccupancy);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

