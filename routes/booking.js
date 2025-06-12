const express = require("express");
const router = express.Router();
const Booking = require("../model/booking"); // Adjust the path as needed
const { sendEmail } = require("../utils/email"); // correct import



router.post("/booking", express.json(), async (req, res) => {
  const {
    userName,
    userEmail,
    userContact,
    bookingDate,
    startTime,
    endTime
  } = req.body;

  if (!userName || !userContact || !bookingDate || !startTime) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check for conflicting bookings on the same date
    const existingBooking = await Booking.findOne({
      bookingDate: new Date(bookingDate),
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });


   
    if (existingBooking) {
      return res.status(409).json({ message: "Time slot already booked." });
    }

     // Extract and format
     const date = new Date(bookingDate);
     const day = date.getDate().toString().padStart(2, '0');
     const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
     const year = date.getFullYear();
 
     const formattedDate = `${day}-${month}-${year}`;

     
    // Create and save the booking
    const newBooking = new Booking({
      userName,
      userEmail,
      userContact,
      bookingDate,
      startTime,
    });

    await newBooking.save();

    await sendEmail(userEmail, {
      userName,
      userContact,
      bookingDate:formattedDate,
      startTime,
      endTime
    })
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
