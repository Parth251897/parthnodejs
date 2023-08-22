const express = require('express')
const multer = require("multer");
const AdminController = require('../controller/admin/AdminController')
const uploadFile = require('../middleware/FileUpload')
const UserManagement = require("../controller/admin/UserManagement")
const router = express.Router();
const {auth,admin} = require("../middleware/auth")
const EmailService = require('../services/EmailService')


/// admin

router.post('/register',uploadFile, AdminController.createSuperuser);

router.post('/login', AdminController.loginSuperuser);

router.patch('/updateAdmin', admin, AdminController.updateSuperuserData);

router.post('/logOut',admin, AdminController.logoutSuperuser);

router.patch('/resetPassword', admin, AdminController.ResetPassword);

router.patch('/updateAdminProfile',admin,  uploadFile ,AdminController.updateadminProfile);



// admin password recover through email

router.post("/sentOtp", EmailService.sentotp);

router.post("/verifyOTP", EmailService.verifyOTP);

router.post("/emailresetPassword", EmailService.resetPassword);


/// admin access user

router.post('/create-student', admin,uploadFile, UserManagement.create);

router.get("/studentDetails", admin, UserManagement.find);

router.get('/all-Students',admin, UserManagement.findAll);

router.patch("/studentUpdate", admin, UserManagement.dataupdate);

router.delete("/deleteStudent/", admin, UserManagement.studentDelete);

router.patch('/students/:studentId',admin, UserManagement.studentActive);

router.patch('/UpdateStudenPprofile',admin,  uploadFile ,UserManagement.updatestudentProfile)

router.patch("/UpdateStudentDocument", admin, uploadFile ,UserManagement.updatestudentDocument);


module.exports = router;