const express = require("express");
const payment = require("../model/payment");
const codeValid = require("../model/codeValid");
const crypto = require("crypto");
const logger = require("../utils/logger");
const router = express.Router();
const qrcode = require("qrcode");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const emailSender = require("../utils/email");
const stripe = require("stripe")(process.env.STRIPE_SECRET_LIVE);

async function createPDFTicket(slicedId) {
  return new Promise(async (resolve, reject) => {
    qrcode.toBuffer(
      `${slicedId}`,
      { type: "png", margin: 0 },
      async function (err, url) {
        if (err) {
          reject(err);
          console.log(err);
        }

        const pdfFilePath = "./assets/general.pdf";
        const existingPdfBytes = fs.readFileSync(pdfFilePath);

        // Load a PDFDocument from the existing PDF bytes
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Get the first page of the document
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        // Get the width and height of the first page
        const { width, height } = firstPage.getSize();

        // Get the image buffer
        const image = await pdfDoc.embedPng(url);
        const imageSize = image.scale(0.8);
        const imageWidth = imageSize.width;
        const imageHeight = imageSize.height;

        firstPage.drawImage(image, {
          x: width / 2 - imageWidth / 2 + 300,
          y: height / 2 - imageHeight / 2 - 28,
          width: imageWidth,
          height: imageHeight - 2,
          opacity: 1,
        });

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();
        resolve(pdfBytes);
      }
    );
  });
}

async function createAndSendTickets(
  email,
  formattedData,
  status,
  payment_method_types,
  numTickets
) {
  const promises = [];
  const attachments = [];

  for (let i = 0; i < numTickets; i++) {
    const uniqueIdentifier = crypto
      .randomBytes(29)
      .toString("hex")
      .slice(0, 29);

    promises.push(
      new Promise(async (resolve, reject) => {
        try {
          const pdfBytes = await createPDFTicket(uniqueIdentifier);
          // Extract relevant payment data
          const paymentData = {
            name: formattedData.name,
            email: email,
            contact: formattedData.contactnumber,
            order_id: uniqueIdentifier,
            status: status,
            method: payment_method_types.join(""),
            numTicket: numTickets
             };

          // Save payment data to MongoDB
          const newPayment = new payment(paymentData);
          const codevalid = new codeValid({ order_id: uniqueIdentifier });
          await codevalid.save(); 
          await newPayment.save();
          console.log("Saved to MongoDB");

          attachments.push({
            filename: `ticket_${i + 1}.pdf`,
            content: pdfBytes,
          });          
          resolve();
        } catch (err) {
          reject(err);
        }
      })
    );
  }

  // Attach the PDF with the unique QR code to the email

  await Promise.all(promises).then(() => {
    emailSender.sendEmail(email, attachments);
  });
}

router.post(
  "/verification",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      console.log("Request is legit");
      const {
        data: {
          object: {
            customer_details: { email },
            custom_fields,
            id,
            amount_total,
            status,
            payment_method_types,
          },
        },
      } = event;

      const slicedId = id.slice(0, 29);
      console.log(id, slicedId);

      const extractedData = custom_fields.map((field) => {
        const { key } = field;
        const value = field.text
          ? field.text.value
          : field.numeric
          ? field.numeric.value
          : "";
        return { [key]: value };
      });

      // Convert the array of objects to a single object
      const formattedData = Object.assign({}, ...extractedData);

      const amount = amount_total / 100;
      const singleTicketPrice = 390;
      const numTickets = Math.floor(amount / singleTicketPrice);

      try {
        //create a qrCode with the token_id
        createAndSendTickets(
          email,
          formattedData,
          status,
          payment_method_types,
          numTickets
        );

        // Send email to customer
      } catch (err) {
        console.error(err);
        logger.error(err);
      }
    } else {
      // Request is not authorized
      res.status(502).json({ status: "Unauthorized" });
      logger.error("Unauthorized");
      return;
    }

    res.status(200).json({ status: "ok" });
  }
);

router.get("/payment/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const paymentData = await codeValid.findOne({ order_id: id });

    if (paymentData) {
      res.status(200).json({ status: "user scanned successfully" });
      await codeValid.deleteOne({ order_id: id });
    } else {
      res
        .status(404)
        .json({ status: "error", message: "User is scanned already" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

module.exports = router;
