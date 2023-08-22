const responseMessage = require("../../src/utils/ResponseMessage.json");
const { JWT_SECRET } = process.env;

const jwtResponse = async function jwtResponse() {
  try {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status:401,
          message: responseMessage.INVLIDEXP });
      }
    });
    console.log("ssecure");
  } catch (error) {
    console.log("Error encrypting password:", error);
    throw error;
  }
};
module.exports = jwtResponse;
