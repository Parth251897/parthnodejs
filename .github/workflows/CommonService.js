const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function passwordencrypt(password) {
  let salt = await bcrypt.genSalt(10);
  let passwordHash = bcrypt.hash(password, salt);
  return passwordHash;
}

function validatePassword(password) {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$&%])(?!.*\s).{6,10}$/;
  return pattern.test(password);
}


module.exports = {passwordencrypt,validatePassword};
