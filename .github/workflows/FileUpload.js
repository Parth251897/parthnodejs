const express = require("express");
const app = express();
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { generateJwt } = require("../utils/jwt");
const verifykey = require("../middleware/auth");
const User = require("../models/User");
const UserController = require("../controller/user/UserController");
const responseMessage = require("../utils/ResponseMessage.json");
const path = require("path");
const StudentReg = require("../models/User");
const frontEndUrl = "http://localhost:3000";

const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profile") {
      cb(null, "public/profile");
    } else if (file.fieldname === "document") {
      cb(null, "public/upload");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

let Upload = multer({ storage: storage }).fields([
  { name: "profile", maxCount: 1 },
  { name: "document" },
]);

async function uploadFile(req, res, next) {
  Upload(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ 
        status:400,
        message:responseMessage.WORNG});
        
    } else {
      if (req.files && req.files.profile) {
        const profilepath = `${frontEndUrl}/profile/${req.files.profile[0].filename}`;
        req.profileUrl = profilepath;
      }

      if (req.files && req.files.document) {
        req.documentUrls = req.files.document.map((file) => {
          const documentpath = `${frontEndUrl}/upload/${file.filename}`;
          return documentpath;
        });
      }

      next();
    }
  });
}

module.exports = uploadFile;
