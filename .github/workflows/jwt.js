const jwt = require("jsonwebtoken");

const { key_Token, ADMINJWT_KEY } = process.env;

const options = {
 
  expiresIn: "24h",
};

async function generateJwt({ _id }) {
  try {
    const payload = { _id };
    const token = jwt.sign(payload, key_Token, options);
    return { error: false, token: token };
  } catch (error) {
    return { error: true };
  }
}

async function admingenerateJwt({ _id }) {
  try {
    const payload = { _id };
    const token = jwt.sign(payload, ADMINJWT_KEY, options);
    return { error: false, token: token };
  } catch (error) {
    return { error: true };
  }
}

module.exports = { generateJwt, admingenerateJwt };
