const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail:{
    type:String,
    required:true
  },
  userContact: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: Date, // Only the date part is considered
    required: true,
  },
  startTime: {
    type: String, // Format: 'HH:mm'
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
