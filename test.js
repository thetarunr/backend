const crypto = require('crypto');

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex'); // returns a string twice the length
};

const randomStr = generateRandomString(16); // generates 32-char hex string
console.log(randomStr);
