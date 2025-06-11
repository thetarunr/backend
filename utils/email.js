const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '8f6f7d001@smtp-brevo.com',
    pass: 'hTna6X0RLy4USkDr'
  }
});

function sendEmail(email, body) {
  const mailOptions = {
    from: "levelupturf@gmail.com",
    to: email,
    subject: "Your booking has been confirmed - LevelUpTurf",
    text: "Thank You",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Event Confirmation</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(to right, #d1fae5, #f0fdf4);
            margin: 0;
            padding: 40px 0;
            display: flex;
            justify-content: center;
          }
          .card {
            background-color: #fff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            padding: 40px 30px;
            max-width: 500px;
            width: 100%;
            box-sizing: border-box;
            text-align: center;
          }
          .card h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #059669;
          }
          .card .icon {
            font-size: 48px;
            color: #34d399;
            margin-bottom: 10px;
          }
          .details {
            margin-top: 30px;
            text-align: left;
          }
          .details p {
            font-size: 16px;
            margin: 12px 0;
            border-bottom: 1px dashed #e5e7eb;
            padding-bottom: 8px;
          }
          .label {
            font-weight: 600;
            color: #111827;
          }
          .value {
            color: #374151;
            margin-left: 5px;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🎉</div>
          <h1>Event Booking Confirmed</h1>
          <p style="color:#4b5563;">Thank you for booking with us. We look forward to seeing you!</p>
          <div class="details">
            <p><span class="label">Name:</span><span class="value">${body.userName}</span></p>
            <p><span class="label">Contact Number:</span><span class="value">${body.userContact}</span></p>
            <p><span class="label">Email:</span><span class="value">${email}</span></p>
            <p><span class="label">Event Date:</span><span class="value">${body.bookingDate}</span></p>
            <p><span class="label">Time Slot:</span><span class="value">${body.startTime} - ${body.endTime}</span></p>
          </div>
          <div class="footer">
            Need to make changes? Contact us at levelupturf@gmail.com
          </div>
        </div>
      </body>
      </html>
    `
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Email error:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
}


// sendEmail(email, body);

module.exports = { sendEmail };

