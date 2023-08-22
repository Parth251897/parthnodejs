const express = require("express");
var bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const responseMessage = require("../../utils/ResponseMessage.json");
require("dotenv").config();
const Superuser = require("../../models/Admin");
const {passwordencrypt,validatePassword} = require("../../services/CommonService");
const { admingenerateJwt } = require("../../utils/jwt");
const frontEndUrl = "http://localhost:3000";

// Signup or Create SuperUser
let isSuperuserRegistered = true;
exports.createSuperuser = async (req, res) => {
  if (isSuperuserRegistered) {
    return res.status(400).json({ 
      status:400,
      massage: responseMessage.ALREADY });
  } else {
    let { userName, email, mobile, password, profile } = req.body;

    if (!validatePassword(password)) {
      return res.status(400).json({
        status: 400,
        message: responseMessage.PASSWORDFORMAT
      });
    }
else{
    if (!userName || !password) {
      return res.status(403).json({ 
        status:403,
        massage: responseMessage.REQ });
    }
  }
    try {
      let existingSuperuser = await Superuser.findOne({
        $or: [{ email }, { mobile }, { userName }],
      });
  

      if (existingSuperuser) {
        return res.status(400).json({ 
          status:400,
          massage: responseMessage.ADMINAVL });
      } else {
        password = await passwordencrypt(password);
        email = email.toLowerCase();

        let superuser = new Superuser({
          userName,
          email,
          mobile,
          password,
          profile: req.profileUrl,
        });
        await superuser.save();

        isSuperuserRegistered = true;

        res.status(201).json({ 
          status:201,
          superuser,
          massage: responseMessage.CREATESUCC });
      }
    } catch (error) {
      console.error({ massage: responseMessage.ERRORNOTCR, error });
      res.status(500).json({ 
        status:500,
        massage: responseMessage.INTERROR });
    }
  }
};

// Superuser login
exports.loginSuperuser = async (req, res) => {
  const { userName,mobile,email, password } = req.body;

  try {
    const superuser = await Superuser.findOne({$or: [{ email }, { userName }, { mobile }]});

    if (!superuser) {
      return res.status(401).json({ 
        status:401,
        massage: responseMessage.NAMENOTFOUND });
    } else {
      const isPasswordValid = await bcrypt.compare(
        password,
        superuser.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ 
          status:401,
          massage: responseMessage.INVALIDPASSWORD });
      } else {
        const { error, token } = await admingenerateJwt(superuser._id);

        if (error) {
          return res.status(400).json({
            status:400,
            error: true,
            message: responseMessage.TOKEN,
          });
        } else {
          return res.status(201).json({
            success: true,
            status:201,
            superuser:email,mobile,userName,
            token: token,
            message: responseMessage.ADMINSUCCESS,
          });
        }
      }
    }
  } catch (error) {
    console.error("Login error", error);
    return res.status(401).json({
      status:401,
      error: true,
      message: responseMessage.INTERROR,
    });
  }
};

//update data
exports.updateSuperuserData = async (req, res) => {
  let { _id, userName, email, mobile } = req.body;
  const Email = email ? email.toLowerCase() : undefined;
  try {
    const superuser = await Superuser.findById({ _id });

    if (!superuser) {
      return res.status(404).json({ 
        status:404,
        message: responseMessage.NOTFOUNDADMIN });
    } else {
      let superuser = {
        email: Email,
        mobile,
        userName,
      };

      const UpdateUser = await Superuser.findByIdAndUpdate(
        { _id },
        { $set: superuser },
        { new: true }
      );

      res.status(201).json({ 
        status:201,
        message: responseMessage.UPDATESUPERSUCC,
        superuser
       });
    }
  } catch (error) {
    console.log(error);
    return res.status(304).json({ 
      status:304,
      message: responseMessage.NOTUPDATE });
  }
};

// profile update
exports.updateadminProfile = async (req, res) => {
  try {
    const userName = req.currentAdmin;
    const user = await Superuser.findById(userName);

    if (!user) {
      return res.status(404).json({
        status:404,
        message: responseMessage.NOTFOUNDADMIN });
    } else {
      if (req.files && req.files.profile) {
        const profileUrl = `${frontEndUrl}/profile/${req.files.profile[0].filename}`;
        user.profile = profileUrl;

        const UpdateUser = await StudentReg.findByIdAndUpdate(
          { _id: req.currentAdmin },
          { $set: user },
          { new: true }
        );

        return res.status(201).json({ 
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

//resetpassword password
exports.ResetPassword = async (req, res) => {
  const { _id, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await Superuser.findOne({ _id});

    if (!user) {
      return res.status(404).json({ 
        status:404,
        message: responseMessage.NOTFOUNDD });
    } else {
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ 
          status:404,
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

            const UpdateUser = await Superuser.findByIdAndUpdate({_id: user._id},{$set:{password:hashedPassword}},{new:true});
          }

          return res.status(201).json({ 
              status:201,
              message: responseMessage.PSSWORDCHANGESUCC });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status:500,
      message: responseMessage.INTERROR });
  }
};

//log out
exports.logoutSuperuser = async (req, res) => {
  try {
    const superuserId = req.currentAdmin;
    let superuser = await Superuser.findById(superuserId);
    
    const LogoutUser = await StudentReg.findByIdAndUpdate(
     
      { _id: superuser._id },
      { new: true }
    );

      return res.status(200).json({ 
        status:200,
        message: responseMessage.ADMINLOGOUTSUCC });
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status:500,
      message: responseMessage.INTERROR });
  }
};
