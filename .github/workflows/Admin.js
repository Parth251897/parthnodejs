const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      require: false,
    },
    email: {
      type: String,
      require: false,
    },
    mobile: {
      type: Number,
      require: false,
    },
    profile: {
      type: Array,
    },
    password: {
      type: String,
      require: false,
    },
    otp: {
      type: String,
    },
    otpexpiration: {
      type: String,
    },
  },
  { versionKey: false }
);

const admin = new mongoose.model("admin", adminSchema);
module.exports = admin;
