const express = require("express");
const router = express.Router();
const Booking = require("../model/booking"); // Adjust path as needed
const { sendEmail } = require("../utils/email"); // Adjust path if needed
const { DateTime } = require("luxon"); // ✅ Import luxon

// POST /booking
router.post("/booking", express.json(), async (req, res) => {
  const {
    userName,
    userEmail,
    userContact,
    bookingDate, // e.g., "2025-06-27"
    startTime,   // e.g., "18:00"
    endTime      // e.g., "19:00"
  } = req.body;

  if (!userName || !userContact || !bookingDate || !startTime || !endTime) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // ✅ Convert bookingDate to Date in IST (India Time)
    const dateObj = DateTime.fromISO(bookingDate, { zone: 'Asia/Kolkata' }).startOf('day');

    // Check for conflicting bookings in DB
    const existingBooking = await Booking.findOne({
      bookingDate: dateObj.toJSDate(),
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingBooking) {
      return res.status(409).json({ message: "Time slot already booked." });
    }

    // ✅ Format date for display (DD-MM-YYYY)
    const formattedDate = dateObj.toFormat('dd-MM-yyyy');

    // Save booking to DB
    const newBooking = new Booking({
      userName,
      userEmail,
      userContact,
      bookingDate: dateObj.toJSDate(),
      startTime,
      endTime
    });

    await newBooking.save();

    // Send confirmation email
    await sendEmail(userEmail, {
      userName,
      userContact,
      bookingDate: formattedDate,
      startTime,
      endTime
    });

    return res.status(201).json({ message: "Booking confirmed.", booking: newBooking });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// GET /booking
router.get("/booking", express.json(), async (req, res) => {
  try {
    const bookings = await Booking.find();

    const filtered = bookings.map(b => ({
      _id: b._id,
      bookingDate: b.bookingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      userName: b.userName,
      userEmail: b.userEmail,
      userContact: b.userContact
    }));

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

module.exports = router;
