const jwt = require("jsonwebtoken");
const responseMessage = require("../utils/ResponseMessage.json");
const { key_Token, ADMINJWT_KEY } = process.env;

const auth = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["token"];

  if (!token) {
    return res.status(403).json({ 
      status:403,
      massage: responseMessage.AUTHREQ });
  }
  try {
    const decodeToken = jwt.verify(token, key_Token);
    req.currentUser = decodeToken._id;
  } catch (error) {
    return res.status(401).json({
      status:401,
      massage: responseMessage.INVLIDEXP });
  }
  return next();
};

const admin = (req, res, next) => {
  const admintoken = req.body.token || req.query.token || req.headers["token"];

  if (!admintoken) {
    return res.status(403).json({
      status:403,
      massage: responseMessage.AUTHREQ });
  }
  try {
    const decodeToken = jwt.verify(admintoken, ADMINJWT_KEY);
    req.currentAdmin = decodeToken._id;
  } catch (error) {
    return res.status(401).json({ 
      status:401,
      massage: responseMessage.INVLIDEXP });
  }
  return next();
};

module.exports = { auth, admin };
