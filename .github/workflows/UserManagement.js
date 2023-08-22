const express = require("express");
var bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const responseMessage = require("../../utils/ResponseMessage.json");
require("dotenv").config();
const Superuser = require("../../models/Admin");
const passwordencrypt = require("../../services/CommonService");
const { generateJwt, admingenerateJwt } = require("../../utils/jwt");
const StudentReg = require("../../models/User");
const UserController = require("../user/UserController");
const uploadFile = require("../../middleware/FileUpload");
const mongoose = require("mongoose");
const frontEndUrl = "http://localhost:3000";

// admin access Student

// create & signup
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
      res.status(400).json({ 
        status:400,
        auth: false, 
        message: responseMessage.EXIST });
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
            status:400,
            message: responseMessage.ERROR,
          });
        } else {
          return res.status(201).json({ 
            status:201,
            message: responseMessage.MSG, 
            newData: data });
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      status:500,
      error: true,
      message: responseMessage.INTERROR,
    });
  }
};

//find by id
exports.find = async (req, res) => {
  try {
    const { _id } = req.body;
    let studentfind = await StudentReg.findById(_id);
    if (!studentfind) {
      return res.status(404).json({
        status:404,
        error: true,
        message: responseMessage.NOTFOUND,
      });
    } else {
      res.status(201).json({
        status:201,
        studentfind,
        message: responseMessage.LOGIN,
      });
    }
  } catch (error) {
    res.status(500).json({
      status:500,
      error: true,
      message: responseMessage.INTERROR,
    });
  }
};

// find all
exports.findAll = async (req, res) => {
  try {
    const allStudents = await StudentReg.find();

    if (allStudents.length === 0) {
      return res.status(404).json({
        status:404,
        error: true,
        message: responseMessage.NOTFOUN,
      });
    } else {
      res.status(201).json({
        status:201,
        students: allStudents,
        message: responseMessage.LOGIN,
      });
    }
  } catch (error) {
    res.status(500).json({
      status:500,
      error: true,
      message: responseMessage.INTERROR,
    });
  }
};

//  update data
exports.dataupdate = async (req, res) => {
  try {
    let { _id, firstName, lastName, email, phone } = req.body;
    const Email = email ? email.toLowerCase() : undefined;

    let existstudent = await StudentReg.findOne({
      $or: [{ email }, { phone }],
    });

    if (existstudent) {
      res.status(400).json({ 
        status:400,
        auth: false,
         message: responseMessage.EXIST });
    } else {
      const userdata = await StudentReg.findById({ _id });

      if (!userdata) {
        return res.status(404).json({ 
          status:404,
          message: responseMessage.NOTFOUND });
      } else {
        userName =
          (firstName + lastName).toLowerCase() +
          Math.floor(Math.random().toFixed(4) * 9999);

        let userdata = {
          firstName,
          lastName,
          email: Email,
          phone,
        };

        const UpdateUser = await StudentReg.findByIdAndUpdate(
          { _id },
          { $set: userdata },
          { new: true }
        );

        res.status(201).json({ 
          stat:201,
          message: responseMessage.UPDATE,
          userdata
         });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ 
      status:500,
      message: responseMessage.INTERROR });
  }
};

// profile update
exports.updatestudentProfile = async (req, res) => {
  try {
    const { _id } = req.body;
    const user = await StudentReg.findById(_id);

    if (!user) {
      return res.status(404).json({ 
        status:404,
        message: responseMessage.NOTFOUND });
    } else {
      if (req.files && req.files.profile) {
        const profileUrl = `${frontEndUrl}/profile/${req.files.profile[0].filename}`;
        user.profile = profileUrl;

        const UpdateUser = await StudentReg.findByIdAndUpdate(
          { _id: _id },
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

//update documents
exports.updatestudentDocument = async (req, res) => {
  try {
    const { _id } = req.body;
    const user = await StudentReg.findById(_id);

    if (!user) {
      return res.status(404).json({ 
        status:404,
        message: responseMessage.NOTFOUND });
    } else {
      if (req.files && req.files.document) {
        const documentUrl = `${frontEndUrl}/upload/${req.files.document[0].filename}`;
        user.document = documentUrl;

        const UpdateUser = await StudentReg.findByIdAndUpdate(
          { _id: _id },
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

//soft delete
exports.studentDelete = async (req, res) => {
  try {
    const { _id } = req.body;

    const user = await StudentReg.findByIdAndUpdate({ _id });

    if (!user) {
      return res.status(404).json({ 
        status:404,
        massage: responseMessage.NOTFOUND });
    } else {
      user.isactive = true;
      await user.save();
    }
    console.log(user);
    return res.status(201).json({
      status:201,
      user,
      massage: responseMessage.DELETEE,
    });
  } catch (error) {
    res.status(500).json({ 
      status:500,
      massage: responseMessage.INTERROR });
  }
};

// to active a student able to login
exports.studentActive = async (req, res) => {
  try {
    let studentId = req.params.studentId;

    let student = await StudentReg.findOne({ studentid: studentId });
    if (!student) {
      return res.status(404).json({ 
        status:404,
        massage: responseMessage.NOTFOUND });
    } else {
      student.isactive = false;
      await student.save();
    }
    return res.status(201).json({ 
      status:201,
      message: responseMessage.ACTIVESUCC });
  } catch (error) {
    console.error({ error });
    res.status(304).json({ 
      status:304,
      massage: responseMessage.NOTACTIVESUCC });
  }
};
