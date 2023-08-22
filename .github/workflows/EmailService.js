const transporter = require("../../src/config/Email.config");
const otpGenerator = require("otp-generator");
const jwtResponse = require("../../src/services/JWTresponse").default;
const { generateJwt } = require("../utils/jwt");
const verifykey = require("../middleware/auth");
const passwordencrypt = require("../../src/services/CommonService");
const responseMessage = require("../../src/utils/ResponseMessage.json");
const StudentReg = require("../../src/models/User");
const Superuser = require("../../src/models/Admin");
require("dotenv").config();

// email password reset forgot update verify
exports.sentotp = async (req, res) => {
  const { email } = req.body;

  try {
    const otp = otpGenerator.generate(4, {
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    const expirationTime = new Date(Date.now() + 2 * 60 * 1000);

    const expirationTimeIST = expirationTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    // console.log(expirationTimeIST);

    const user = await StudentReg.findOneAndUpdate(
      { email },
      { $set: { otp: otp, otpexpiration: expirationTimeIST } },
      { new: true }
    );

    const superuser = await Superuser.findOneAndUpdate(
      { email },
      { $set: { otp: otp, otpexpiration: expirationTimeIST } },
      { new: true }
    );

    if (!user && !superuser) {
      return res.status(404).json({
        status: 404,
        message: responseMessage.NOTFOUND,
      });
    } else {
      if (user) {
        await user.save();
      }

      if (superuser) {
        await superuser.save();
      }

      // Send the OTP to the user's email
      const mailOptions = {
        from: "parth@example.com",
        to: email,
        subject: "OTP Verification",
        text: `Your OTP for password reset is: ${otp}. 
      Please use this OTP within 10 minutes to reset your password. 
      If you didn't request this, please ignore this email.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
          return res.status(502).json({
            status: 502,
            message: responseMessage.NOTSETOTPSUCC,
          });
        } else {
          console.log("Email sent:", info.response);
          return res.status(200).json({
            status: 200,
            message: responseMessage.SENTSUCC,
          });
        }
      });
    }
  } catch (error) {
    console.log("Error sending OTP:", error);
    return res.status(500).json({
      status: 500,
      message: responseMessage.INTERROR,
    });
  }
};

// otp verify
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user =
      (await StudentReg.findOne({ email })) ||
      (await Superuser.findOne({ email }));

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: responseMessage.NOTFOUND,
      });
    } else {
      if (otp !== user.otp) {
        return res.status(400).json({
          status: 400,
          message: responseMessage.INVALIDOTP,
        });
      } else {
        if (
          user.otpexpiration <
          new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        )
          return res.status(400).json({
            status: 400,
            message: responseMessage.OTPEXPIRED,
          });
        else {
          user.otp = null;
          user.otpExpiration = null;
          await user.save();

          return res.status(201).json({
            status: 201,
            message: responseMessage.OTPVERYSUCC,
          });
        }
      }
    }
  } catch (error) {
    console.log("Error verifying OTP:", error);
    return res.status(500).json({
      status: 500,
      message: responseMessage.ERROROTP,
    });
  }
};

// verify opt n reset pass
exports.resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    const user =
      (await StudentReg.findOne({ email })) ||
      (await Superuser.findOne({ email }));

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: responseMessage.NOTFOUND,
      });
    } 
    else {
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: 400,
          message: responseMessage.PASSNOTMATCH,
        });
      }
      else if (
        user.otpexpiration <
        new Date().toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })
      ) {
        return res.status(400).json({
          status: 400,
          message: responseMessage.OTPEXPIRED,
        });
      }

      else {
        const hashedPassword = await passwordencrypt(password);

        user.password = hashedPassword;
        await user.save();

        return res.status(201).json({
          status: 201,
          message: responseMessage.PASSRESTSUCC,
        });
      }
    }
  } catch (error) {
    console.log("Error resetting password:", error);
    return res.status(500).json({
      status: 500,
      message: responseMessage.INTERROR,
    });
  }
};
