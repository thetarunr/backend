const express = require("express");
const router = express.Router();
const Booking = require("../model/booking"); // Adjust the path as needed
const { sendEmail } = require("../utils/email"); // correct import



router.post("/booking", express.json(), async (req, res) => {
  const {
    userName,
    userEmail,
    userContact,
    bookingDate, // e.g., "2025-06-27"
    startTime,
    endTime
  } = req.body;

  if (!userName || !userContact || !bookingDate || !startTime) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Construct local date (force IST)
    const dateObj = new Date(`${bookingDate}T00:00:00+05:30`);

    // Check for conflicting bookings
    const existingBooking = await Booking.findOne({
      bookingDate: dateObj,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingBooking) {
      return res.status(409).json({ message: "Time slot already booked." });
    }

    // Format for email
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;

    // Save
    const newBooking = new Booking({
      userName,
      userEmail,
      userContact,
      bookingDate: dateObj,
      startTime,
      endTime
    });

    await newBooking.save();

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


router.get("/booking", express.json(), async (req, res) => {
  try {
    const bookings = await Booking.find();

    const filtered = bookings.map(b => ({
      _id: b._id,
      bookingDate: b.bookingDate,
      startTime: b.startTime
    }));

    res.status(200).json(filtered);

  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

module.exports = router;
