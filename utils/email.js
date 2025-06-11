const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "blessythomas1606@gmail.com",
    pass: "N1t4KPTCOQH0M2zw",
  },
});

function sendEmail(email, attachments) {
  const mailOptions = {
    from: "donotreply@navdhara23.com",
    to: email,
    subject: "Navdhara Tickets",
    text: "Thank You",
    html: `
            <head>
              <style>
                  body {
                      font-family: 'Arial', sans-serif;
                      background-color: #0000;
                      text-align: center;
                  }
                  .container {
                      background-color: #ffffff;
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      border-radius: 10px;
                      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                  }
                  h1 {
                      color: #333333;
                      margin-top: 20px;
                  }
                  p {
                      color: #666666;
                      font-size: 16px;
                  }
                  ul {
                      list-style: none;
                      padding: 0;
                      font-size: 16px;
                  }
                  a {
                      color: #007bff;
                      text-decoration: none;
                  }
                  img {
                      max-width: 100%;
                      height: auto;
                      border-radius:50%;
                  }
              </style>
            </head>
            <body>
              <div class="container">
                  <h1>Thank You for Your Ticket Purchase!</h1>
                  <p>We're absolutely delighted that you've secured tickets for our upcoming event.</p>
                  <p>We can hardly contain our excitement to see you at the venue!</p>
                  <p><strong>Event Details:</strong></p>
                  <ul>
                      <li><strong>Date:</strong> 15<sup>th</sup>October 2023 </li>
                      <li><strong>Time:</strong> 4:00 PM</li>
                      <li><strong>Venue:</strong> Thota Penta Reddy Gardens, Bolaram</li>
                  </ul>
                  <p>If you have any questions or require further assistance, please feel free to <a href="https://www.instagram.com/navdhara.23/">contact us</a>.</p>
                  <p>We're committed to providing you with an unforgettable experience!</p>
              </div>
            </body>
            </html>
            `,
    attachments: attachments,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = { sendEmail };
