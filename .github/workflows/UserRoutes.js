const express = require('express')
const multer = require("multer");
const UserController = require('../controller/user/UserController')
const uploadFile = require('../middleware/FileUpload')
const router = express.Router();
const {auth} = require("../middleware/auth")
const EmailService = require('../services/EmailService')


// create student data
router.post('/signup', uploadFile,UserController.create);

// login & logout student
router.post('/login', UserController.StudentLogin);
router.post('/logOut', auth, UserController.logOut);

// Find details & Update
router.get("/studentData", auth, UserController.find);
router.patch("/updateDetails", auth , UserController.dataupdate);

//Delete Student profile
router.delete("/delete/:id", auth, UserController.studentDelete);

//fileupload and profile
 router.patch('/updateProfile',auth,  uploadFile ,UserController.updateProfile)
 router.patch("/updateDocument", auth, uploadFile ,UserController.updateDocument);

//Password Reset Using Email OTP
router.post("/sentOtp", EmailService.sentotp);
router.post("/verifyOTP", EmailService.verifyOTP);
router.post("/resetPassword", EmailService.resetPassword);

// Change Password
router.post("/changePassword", auth, UserController.changePassword);


module.exports = router