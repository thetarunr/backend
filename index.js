require('dotenv').config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const env = require("dotenv");
const mongoose = require("mongoose"); // Import the MongoDB driver
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const errorController = require("./controller/errorController");
const logger = require("./utils/logger");
const jwt = require("jsonwebtoken")

//CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});



// JWT
const SECRET = process.env.JWT_SECRET;

// Route to generate token (you can protect this or do it manually)
app.post('/api/generate-token', (req, res) => {
  const payload = {
    role: 'client'
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: process.env.JWT_EXPIRY });
  res.json({ token });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = payload;
    next();
  });
};


//config
app.use(bodyParser.json());
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"))
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(xss());

env.config();

app.use((req,res,next) => {
  console.log(req.body)
  next();
})

// routes
app.use("/", verifyToken, require("./routes/booking"))

app.get("/test", (req, res) => {
  res.send("hello");
});

const PORT = process.env.PORT || 1337;

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => logger.error(error.message));

app.use(errorController); // Error handling middleware has to be kept at the end

//uncaught exception
process.on("uncaughtException", (err) => {
  console.log("Shutting down...");
  console.log(err.name, err.message);
  logger.error(err);
  process.exit(1);
});
