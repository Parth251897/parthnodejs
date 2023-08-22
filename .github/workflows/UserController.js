const express = require("express");
const multer = require("multer");
const fs = require("fs");
var bcrypt = require("bcryptjs");
require("dotenv").config();
const responseMessage = require("../../utils/ResponseMessage.json");
const StudentReg = require("../../models/User");
const {passwordencrypt,validatePassword} = require("../../services/CommonService");
const uploadFile = require("../../middleware/FileUpload");
const { generateJwt } = require("../../utils/jwt");
const { auth } = require("../../middleware/auth");
const frontEndUrl = "http://localhost:3000";

//create or signup
exports.create = async (req, res) => {
  try {
    let {
      studentid,
      userName,
      firstName,
      lastName,
      email,
      phone,
      password,
      document,
      profile,
    } = req.body;

    if (!validatePassword(password)) {
      return res.status(400).json({
        status: 400,
        message: responseMessage.PASSWORDFORMAT
      });
    }

    let existstudent = await StudentReg.findOne({
      $or: [{ email }, { phone }, { userName }],
    });

    if (existstudent) {
      res.status(403).json({ 
       status: 403,
        auth: false, message: responseMessage.EXIST });
    } else {
      studentid = Math.floor(Math.random().toFixed(4) * 9999);
      userName =
        (firstName + lastName).toLowerCase() +
        Math.floor(Math.random().toFixed(4) * 9999);
      password = await passwordencrypt(password);
      email = email.toLowerCase();

      let newData = new StudentReg({
        studentid,
        userName,
        firstName,
        lastName,
        email,
        phone,
        password,
        document: req.documentUrls,
        profile: req.profileUrl,
      });

      newData.save().then((data, error) => {
        if (error) {
          return res.status(400).json({
            status: 400,
            message: responseMessage.ERROR,
          });
        } else {
          return res.status(201).json({ status: 201,
            message: responseMessage.MSG, newData: data });
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status:500,
      error: true,
      message: responseMessage.INTERROR, });
  }
};

// login  jwt
exports.StudentLogin = async (req, res) => {
  try {
    let { userName, email, phone, password, _id } = req.body;

    let userLogin = await StudentReg.findOne({$or: [{ email }, { userName }, { phone }]});

    if (!userLogin) {
      console.log(userLogin);
      return res.status(404).json({
        status: 404,
        error: true,
        message: responseMessage.NOTFOUND,
      });
    } else {
      if (userLogin.isactive) {
        return res.status(401).json({
          status: 401,
          error: true,
          massage: responseMessage.ISACTIVE,
        });
      } else {
        const isvalid = await bcrypt.compare(password, userLogin.password);

        if (!isvalid) {
          return res.status(404).json({
            status: 404,
            error: true,
            message: responseMessage.NOTMATCH,
          });
        } else {
          const { error, token } = await generateJwt(userLogin._id);
          if (error) {
            return res.status(400).json({
              status: 400,
              error: true,
              message: responseMessage.TOKEN,
            });
          } else {
            // userLogin.token = token;
            // await userLogin.save();

            return res.status(201).json({
              status: 201,
              success: true,
              userLogin:email,phone,userName,
              token: token,
              message: responseMessage.SUCCESS, });
          }
        }
      }
    }
  } catch (error) {
    console.error("Login error", error);
    return res.status(400).json({
      status:400,
      error: true,
      message: responseMessage.NOTSUCCESS, });
  }
};

//find
exports.find = async (req, res) => {
  try {
    let studentfind = await StudentReg.findById({ _id: req.currentUser });
    if (!studentfind) {
      return res.status(404).json({
        status:404,
        error: true,
        message: responseMessage.NOTFOUND,
      });
    } else {
      res.status(200).json({
        status:200,
        studentfind,
        message: responseMessage.LOGIN,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status:500,
      error: true,
      message: responseMessage.INTERROR,
    });
  }
};

//  update data
exports.dataupdate = async (req, res) => {
  try {
    let { email, phone } = req.body;

    const Email = email ? email.toLowerCase() : undefined;

    let existstudent = await StudentReg.findOne({
      $or: [{ email }, { phone }],
    });

    if (existstudent) {
      res.status(400).json({
        status:400,
         message: responseMessage.EXIST});
    } else {
      const userdata = await StudentReg.findById({ _id: req.currentUser });

      if (!userdata) {
        return res.status(404).json({ 
          status:404,
          message: responseMessage.NOTFOUND });
      } else {
        let userdata = {
          email: Email,
          phone,
        };
        const UpdateUser = await StudentReg.findByIdAndUpdate(
          { _id: req.currentUser },
          { $set: userdata },
          { new: true }
        );

        res.status(201).json({ 
          status:201,
          message: responseMessage.UPDATE,
          userdata
        });
      }
    }
  } catch (error) {
    res.status(304).json({ 
      status:304,
      message: responseMessage.NOTUPDATE });
  }
};

//soft delete
exports.studentDelete = async (req, res) => {
  try {
    const userId = req.currentUser;
    let user = await StudentReg.findById(userId);
    if (!user) {
      StudentReg.findByIdAndUpdate({ _id: user._id }, { isactive: true });
      return res.status(404).json({ 
        status:404,
        massage: responseMessage.NOTFOUND });
    } else {
      user.isactive = true;
      await user.save();
    }
    return res.status(201).json({ 
      status:201,
      massage: responseMessage.DELETE });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status:500,
      error: true,
      message: responseMessage.INTERROR,
    });
  }
};

// Update password
exports.changePassword = async (req, res) => {
  const { _id, currentPassword, newPassword, confirmPassword } = req.body;
  
  try {
       
 const user = await StudentReg.findOne({ _id:req.currentUser });

    if (!user) {
      return res.status(404).json({ 
        status:404,
        message: responseMessage.NOTFOUND });
    } else {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ 
          status:400,
          message: responseMessage.INCORRECT });
      } else {
        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if (isSamePassword) {
          return res.status(400).json({
               status:400,
               message: responseMessage.NEWDIFFERENTOLD });
        } else {
          if (newPassword !== confirmPassword) {
            return res.status(400).json({
                 status:400,
                 message: responseMessage.NEWCOMMATCH });
          } else {
            const hashedPassword = await passwordencrypt(
              newPassword,
              user.password
            );
            const UpdateUser = await StudentReg.findByIdAndUpdate({_id: user._id},{$set:{password:hashedPassword}},{new:true});
          }
          return res.status(201).json({ 
            status:201,
              message: responseMessage.PSSWORDCHANGESUCC });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(304).json({ 
status:304,
      message: responseMessage.NOTCHANGE });
  }
};

// profile update
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.currentUser;
    const user = await StudentReg.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        status:404,
        message: responseMessage.NOTFOUND });
    } else {
      if (req.files && req.files.profile) {
        const profileUrl = `${frontEndUrl}/profile/${req.files.profile[0].filename}`;
        user.profile = profileUrl;

        const UpdateUser = await StudentReg.findByIdAndUpdate(
          { _id: req.currentUser },
          { $set: user },
          { new: true }
        );

        return res
          .status(201).json({ 
            status:201,
            message: responseMessage.PROFILEUPSUCC, profileUrl });
      } else {
        return res.status(400).json({ 
          status:400,
          message: responseMessage.NOTPROFILE });
      }
    }
  } catch (error) {
    res.status(500).json({ 
      status:500,
      message: responseMessage.INTERROR });
  }
};

//update documents
exports.updateDocument = async (req, res) => {
  try {
    const userId = req.currentUser;
    const user = await StudentReg.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        status:404,
        message: responseMessage.NOTFOUND });
    } else {
      if (req.files && req.files.document) {
        const documentUrl = `${frontEndUrl}/upload/${req.files.document[0].filename}`;
        user.document = documentUrl;

        const UpdateUser = await StudentReg.findByIdAndUpdate(
          { _id: req.currentUser },
          { $set: user },
          { new: true }
        );

        return res.status(201).json({
            status:201,
            message: responseMessage.DOCUMENT, documentUrl });
      } else {
        return res.status(400).json({ 
          status:400,
          message: responseMessage.NOTDOCUMENT });
      }
    }
  } catch (error) {
    res.status(500).json({ 
      status:500,
      message: responseMessage.INTERROR });
  }
};

// log out
exports.logOut = async (req, res) => {
  try {
    const userId = req.currentUser;
    let user = await StudentReg.findById(userId);
    const LogoutUser = await StudentReg.findByIdAndUpdate(
      { _id: user._id },
      { new: true }
    );
      
      return res.status(200).json({ 
        status:200,
        message: responseMessage.LOGOUT });
      } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status:500,
      message: responseMessage.INTERROR, error });
  }
};

