const mongoose = require("mongoose");

const clgSchema = new mongoose.Schema(
  {
    studentid: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: false,
    },
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: Number,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },

    profile: {
      type: Array,
      require: false,
    },
    document: {
      type: Array,
      require: false,
    },
    otp: {
      type: String,
    },
    isactive: {
      type: Boolean,
      default: false,
    },
    otpexpiration: {
      type: String,
    },

    token: {
      type: String,
    },
  },
  { versionKey: false }
);

const StudentReg = new mongoose.model("StudentReg", clgSchema);
module.exports = StudentReg;
